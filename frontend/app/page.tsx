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

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api("/courses").then(setCourses).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">DevFocus</h1>
          <p className="text-lg text-blue-100 mb-8">
            개발자를 위한 학습 플랫폼 — 강의, 집중 타이머, Q&A
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/courses"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              강의 둘러보기
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">추천 강의</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden transition">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{course.title}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-gray-500 mt-2 text-sm">{course.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">체계적인 강의</h3>
            <p className="text-gray-500">단계별 커리큘럼으로 효율적으로 학습하세요</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold mb-2">집중 타이머</h3>
            <p className="text-gray-500">학습 시간을 기록하고 집중력을 높이세요</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Q&A 게시판</h3>
            <p className="text-gray-500">궁금한 점을 질문하고 함께 성장하세요</p>
          </div>
        </div>
      </section>
    </div>
  );
}
