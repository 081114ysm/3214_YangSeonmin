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

  if (!course)
    return <p className="p-8 text-[#717171]">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Course header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Course
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1
              className="text-4xl font-extrabold text-[#222222]"
              style={{ letterSpacing: "-1px" }}
            >
              {course.title}
            </h1>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  course.liked
                    ? "bg-[#FFF0F3] text-[#FF385C]"
                    : "bg-white text-[#717171] hover:bg-[#ebebeb]"
                }`}
              >
                {course.liked ? "♥" : "♡"} {course.likeCount}
              </button>
              {!course.enrolled ? (
                <button
                  onClick={handleEnroll}
                  className="px-5 py-2 bg-[#FF385C] text-white text-sm rounded-full hover:bg-[#e0314f] transition-colors font-medium"
                >
                  수강 신청
                </button>
              ) : (
                <span className="px-5 py-2 bg-[#FFF0F3] text-[#FF385C] text-sm rounded-full font-medium">
                  수강 중
                </span>
              )}
            </div>
          </div>
          <p className="text-[#717171] mt-4 text-base leading-relaxed">{course.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Lessons */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          Lessons
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          강의 목록
        </h2>
        <div className="space-y-2 mb-12">
          {course.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex justify-between items-center"
            >
              <div>
                <span className="text-[#FF385C] font-mono text-sm mr-3">{lesson.order}.</span>
                <span className="font-medium text-[#222222]">{lesson.title}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#717171]">
                  {Math.floor(lesson.duration / 60)}분
                </span>
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-[#222222] text-white text-sm rounded-full hover:bg-[#3a3a3a] transition-colors"
                >
                  강의 보기
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Comments */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          Discussion
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          댓글 ({course.comments.length})
        </h2>
        <form onSubmit={handleComment} className="flex gap-2 mb-8">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다"}
            className="flex-1 border border-[#ebebeb] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
            disabled={!isLoggedIn}
          />
          <button
            type="submit"
            disabled={!isLoggedIn}
            className="px-6 py-3 bg-[#FF385C] text-white rounded-xl hover:bg-[#e0314f] transition-colors disabled:opacity-40 text-sm font-medium"
          >
            작성
          </button>
        </form>
        <div className="space-y-3">
          {course.comments.map((comment) => (
            <div key={comment.id} className="bg-[#F7F7F7] rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-[#222222] text-sm">{comment.nickname}</span>
                <span className="text-xs text-[#717171]">
                  {new Date(comment.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="text-[#717171] text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {course.comments.length === 0 && (
            <p className="text-[#717171] text-center py-6 text-sm">아직 댓글이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
