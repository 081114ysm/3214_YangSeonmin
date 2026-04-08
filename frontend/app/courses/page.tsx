"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    api("/courses/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "전체") params.set("category", selectedCategory);
    if (search) params.set("search", search);
    const query = params.toString();
    api(`/courses${query ? `?${query}` : ""}`).then(setCourses).catch(() => {});
  }, [selectedCategory, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">강의 목록</h1>

        {/* 필터 영역 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          {/* 카테고리 필터 */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="강의 검색..."
              className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
            >
              검색
            </button>
          </form>
        </div>

        {/* 강의 목록 */}
        {courses.length === 0 ? (
          <p className="text-gray-400 text-center py-12">검색 결과가 없습니다</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden transition">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center relative">
                    <span className="text-white text-2xl font-bold">{course.title}</span>
                    {course.category && (
                      <span className="absolute top-3 right-3 bg-white/90 text-blue-600 text-xs font-semibold px-2 py-1 rounded">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg">{course.title}</h2>
                    <p className="text-gray-500 mt-2">{course.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
