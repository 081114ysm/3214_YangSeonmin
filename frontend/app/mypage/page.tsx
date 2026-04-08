"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface Enrollment {
  id: number;
  title: string;
  description: string;
  category: string;
  enrolled_at: string;
  total_lessons: number;
  watched_lessons: number;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api("/users/me")
      .then(setUser)
      .catch(() => router.push("/login"));

    api("/courses/my")
      .then(setEnrollments)
      .catch(() => {});
  }, [router]);

  if (!user) return <p className="p-8 text-gray-500">로딩 중...</p>;

  const totalProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, c) => {
            if (c.total_lessons === 0) return sum;
            return sum + (c.watched_lessons / c.total_lessons) * 100;
          }, 0) / enrollments.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        <p className="text-gray-600 mb-8">
          <span className="font-semibold text-blue-600">{user.nickname}</span>님의 학습 현황
        </p>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-1">수강 강의</h2>
            <p className="text-3xl font-bold text-blue-600">{enrollments.length}개</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-1">전체 진행률</h2>
            <p className="text-3xl font-bold text-green-600">{totalProgress}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-1">완료 강의</h2>
            <p className="text-3xl font-bold text-purple-600">
              {enrollments.filter((c) => c.total_lessons > 0 && c.watched_lessons >= c.total_lessons).length}개
            </p>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-3">내 정보</h2>
          <div className="flex gap-8">
            <div>
              <span className="text-gray-500 text-sm">닉네임</span>
              <p className="font-medium">{user.nickname}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">이메일</span>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* 수강 목록 */}
        <h2 className="text-xl font-bold mb-4">수강 중인 강의</h2>
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-400 mb-4">아직 수강 중인 강의가 없습니다</p>
            <Link
              href="/courses"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block"
            >
              강의 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((course) => {
              const progress =
                course.total_lessons > 0
                  ? Math.round((course.watched_lessons / course.total_lessons) * 100)
                  : 0;

              return (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{course.title}</h3>
                        <p className="text-gray-500 text-sm">{course.description}</p>
                      </div>
                      {course.category && (
                        <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded shrink-0 ml-3">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {/* 진행도 바 */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">
                          {course.watched_lessons} / {course.total_lessons} 강의 완료
                        </span>
                        <span className={`font-semibold ${progress === 100 ? "text-green-600" : "text-blue-600"}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            progress === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                      수강 시작: {new Date(course.enrolled_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
