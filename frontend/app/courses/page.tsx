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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api("/courses").then(setCourses).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">강의 목록</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden transition">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{course.title}</span>
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg">{course.title}</h2>
                  <p className="text-gray-500 mt-2">{course.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
