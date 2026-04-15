"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

const FEATURES = [
  {
    label: "LEARN",
    title: "체계적인 강의",
    desc: "단계별 커리큘럼으로 효율적으로 학습하세요. 카테고리별 정리된 강의를 언제든지 수강할 수 있습니다.",
  },
  {
    label: "FOCUS",
    title: "집중 타이머",
    desc: "학습 시간을 기록하고 집중력을 높이세요. 세션 기록으로 나의 학습 패턴을 파악할 수 있습니다.",
  },
  {
    label: "CONNECT",
    title: "Q&A 게시판",
    desc: "궁금한 점을 질문하고 함께 성장하세요. 개발자 커뮤니티에서 답변을 받고 지식을 나눕니다.",
  },
  {
    label: "ACCOUNT",
    title: "개인 대시보드",
    desc: "수강 현황과 집중 시간을 한눈에 확인하세요. 나만의 코드 스니펫도 저장하고 관리할 수 있습니다.",
  },
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api("/courses").then(setCourses).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — dark cover slide */}
      <section className="bg-[#222222] text-white py-28 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#FF385C] text-sm font-extrabold tracking-[3px] uppercase mb-6">
            DEVFOCUS
          </p>
          <h1
            className="text-6xl font-extrabold leading-tight tracking-tight mb-6"
            style={{ letterSpacing: "-2px" }}
          >
            개발자를 위한
            <br />
            학습 플랫폼
          </h1>
          <p className="text-[#b0b0b0] text-xl font-normal max-w-xl leading-relaxed mb-10">
            강의, 집중 타이머, Q&A — 개발 학습의 모든 것을 한 곳에서
          </p>
          <div className="flex gap-4">
            <Link
              href="/courses"
              className="px-7 py-3 bg-[#FF385C] text-white font-semibold rounded-full hover:bg-[#e0314f] transition-colors"
            >
              강의 둘러보기
            </Link>
            <Link
              href="/register"
              className="px-7 py-3 bg-white text-[#222222] font-semibold rounded-full hover:bg-[#F7F7F7] transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Features
          </p>
          <h2
            className="text-4xl font-extrabold text-[#222222] mb-12"
            style={{ letterSpacing: "-1px" }}
          >
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="bg-[#F7F7F7] rounded-2xl p-8 border-l-4 border-[#FF385C]"
              >
                <p className="text-[#FF385C] text-xs font-extrabold tracking-widest uppercase mb-3">
                  {f.label}
                </p>
                <h3 className="text-lg font-bold text-[#222222] mb-3">{f.title}</h3>
                <p className="text-[#717171] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended courses */}
      <section className="py-24 px-8 bg-[#F7F7F7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Courses
          </p>
          <h2
            className="text-4xl font-extrabold text-[#222222] mb-12"
            style={{ letterSpacing: "-1px" }}
          >
            추천 강의
          </h2>
          {courses.length === 0 ? (
            <p className="text-[#717171] text-center py-12">강의를 불러오는 중입니다</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-44 bg-[#F7F7F7] flex items-center justify-center px-6">
                      <span className="text-[#222222] text-lg font-bold text-center leading-snug">
                        {course.title}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-[#222222] text-base mb-2">{course.title}</h3>
                      <p className="text-[#717171] text-sm leading-relaxed">{course.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
