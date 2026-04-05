"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  order: number;
  duration: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    api(`/courses/${params.id}`).then(setCourse).catch(() => {});
  }, [params.id]);

  if (!course) return <p className="p-8 text-gray-500">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>
        <div className="space-y-3">
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
      </div>
    </div>
  );
}
