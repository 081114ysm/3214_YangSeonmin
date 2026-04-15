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
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Courses
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            강의 목록
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Filter bar */}
        <div className="bg-[#F7F7F7] rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#FF385C] text-white"
                    : "bg-white text-[#717171] hover:bg-[#ebebeb]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="강의 검색..."
              className="border border-[#ebebeb] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] bg-white"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#222222] text-white text-sm rounded-xl hover:bg-[#3a3a3a] transition-colors"
            >
              검색
            </button>
          </form>
        </div>

        {/* Course grid */}
        {courses.length === 0 ? (
          <p className="text-[#717171] text-center py-16">검색 결과가 없습니다</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <div className="bg-white border border-[#F7F7F7] rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-full h-44 bg-[#F7F7F7] flex items-center justify-center px-6 relative">
                    <span className="text-[#222222] text-lg font-bold text-center leading-snug">
                      {course.title}
                    </span>
                    {course.category && (
                      <span className="absolute top-3 right-3 bg-[#FFF0F3] text-[#FF385C] text-xs font-semibold px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="font-bold text-[#222222] text-base mb-2">{course.title}</h2>
                    <p className="text-[#717171] text-sm leading-relaxed">{course.description}</p>
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
