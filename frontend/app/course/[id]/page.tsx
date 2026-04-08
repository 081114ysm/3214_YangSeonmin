"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  order: number;
  duration: number;
}

interface Comment {
  id: number;
  user_id: number;
  nickname: string;
  content: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  likeCount: number;
  liked: boolean;
  enrolled: boolean;
  comments: Comment[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [commentText, setCommentText] = useState("");
  const isLoggedIn = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    api(`/courses/${params.id}`).then(setCourse).catch(() => {});
  }, [params.id]);

  const handleLike = async () => {
    if (!isLoggedIn) return router.push("/login");
    try {
      const result = await api(`/courses/${params.id}/like`, { method: "POST" });
      setCourse((prev) =>
        prev ? { ...prev, liked: result.liked, likeCount: result.likeCount } : prev
      );
    } catch {}
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) return router.push("/login");
    try {
      await api(`/courses/${params.id}/enroll`, { method: "POST" });
      setCourse((prev) => (prev ? { ...prev, enrolled: true } : prev));
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return router.push("/login");
    if (!commentText.trim()) return;
    try {
      const comments = await api(`/courses/${params.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });
      setCourse((prev) => (prev ? { ...prev, comments } : prev));
      setCommentText("");
    } catch {}
  };

  if (!course) return <p className="p-8 text-gray-500">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                course.liked
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {course.liked ? "♥" : "♡"} {course.likeCount}
            </button>
            {!course.enrolled ? (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition font-medium"
              >
                수강 신청
              </button>
            ) : (
              <span className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                수강 중
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-8">{course.description}</p>

        {/* 강의 목록 */}
        <h2 className="text-xl font-bold mb-4">강의 목록</h2>
        <div className="space-y-3 mb-10">
          {course.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <span className="text-blue-500 font-mono mr-3">{lesson.order}.</span>
                <span className="font-medium">{lesson.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {Math.floor(lesson.duration / 60)}분
                </span>
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  강의 보기
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 댓글 섹션 */}
        <h2 className="text-xl font-bold mb-4">댓글 ({course.comments.length})</h2>
        <form onSubmit={handleComment} className="flex gap-2 mb-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다"}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={!isLoggedIn}
          />
          <button
            type="submit"
            disabled={!isLoggedIn}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            작성
          </button>
        </form>
        <div className="space-y-3">
          {course.comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-600">{comment.nickname}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
          {course.comments.length === 0 && (
            <p className="text-gray-400 text-center py-4">아직 댓글이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
