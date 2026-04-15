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

  if (!user) return <p className="p-8 text-[#717171]">로딩 중...</p>;

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            My Account
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            마이페이지
          </h1>
          <p className="text-[#717171] mt-2">
            <span className="font-semibold text-[#FF385C]">{user.nickname}</span>님의 학습 현황
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              수강 강의
            </p>
            <p className="text-4xl font-extrabold text-[#FF385C]">{enrollments.length}개</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              전체 진행률
            </p>
            <p className="text-4xl font-extrabold text-[#222222]">{totalProgress}%</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              완료 강의
            </p>
            <p className="text-4xl font-extrabold text-[#222222]">
              {enrollments.filter((c) => c.total_lessons > 0 && c.watched_lessons >= c.total_lessons).length}개
            </p>
          </div>
        </div>

        {/* User info */}
        <div className="bg-[#F7F7F7] rounded-2xl p-8 mb-10">
          <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-4">
            내 정보
          </p>
          <div className="flex gap-10">
            <div>
              <span className="text-[#717171] text-xs uppercase tracking-wider">닉네임</span>
              <p className="font-semibold text-[#222222] mt-1">{user.nickname}</p>
            </div>
            <div>
              <span className="text-[#717171] text-xs uppercase tracking-wider">이메일</span>
              <p className="font-semibold text-[#222222] mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Enrollments */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          Learning
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          수강 중인 강의
        </h2>
        {enrollments.length === 0 ? (
          <div className="bg-[#F7F7F7] rounded-2xl p-10 text-center">
            <p className="text-[#717171] mb-5">아직 수강 중인 강의가 없습니다</p>
            <Link
              href="/courses"
              className="px-7 py-3 bg-[#FF385C] text-white rounded-full font-medium hover:bg-[#e0314f] transition-colors inline-block text-sm"
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
                  <div className="bg-[#F7F7F7] rounded-2xl p-6 hover:bg-[#ebebeb] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-[#222222] text-base">{course.title}</h3>
                        <p className="text-[#717171] text-sm mt-1">{course.description}</p>
                      </div>
                      {course.category && (
                        <span className="bg-[#FFF0F3] text-[#FF385C] text-xs font-semibold px-3 py-1 rounded-full shrink-0 ml-3">
                          {course.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#717171]">
                          {course.watched_lessons} / {course.total_lessons} 강의 완료
                        </span>
                        <span className={`font-semibold ${progress === 100 ? "text-[#FF385C]" : "text-[#222222]"}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-[#FF385C] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-[#717171] mt-3">
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
