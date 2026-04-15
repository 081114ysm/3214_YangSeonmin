"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Stats {
  userCount: number;
  courseCount: number;
  enrollCount: number;
  questionCount: number;
  paymentTotal: number;
}

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  instructor_name: string;
  enroll_count: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "users" | "courses">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadStats();
  }, [router]);

  const loadStats = () =>
    api("/admin/stats").then(setStats).catch(() => router.push("/dashboard"));

  const loadUsers = () =>
    api("/admin/users").then(setUsers).catch(() => {});

  const loadCourses = () =>
    api("/admin/courses").then(setCourses).catch(() => {});

  const handleTabChange = (t: typeof tab) => {
    setTab(t);
    if (t === "users") loadUsers();
    if (t === "courses") loadCourses();
  };

  const changeRole = async (userId: number, role: string) => {
    try {
      await api(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMessage("역할 변경 완료");
      loadUsers();
    } catch {
      setMessage("역할 변경 실패");
    }
  };

  const deleteCourse = async (courseId: number) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    try {
      await api(`/admin/courses/${courseId}`, { method: "DELETE" });
      setMessage("강의 삭제 완료");
      loadCourses();
    } catch {
      setMessage("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#222222] py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">Admin</p>
          <h1 className="text-4xl font-extrabold text-white" style={{ letterSpacing: "-1px" }}>
            관리자 패널
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {message && (
          <div className="mb-4 p-3 bg-[#FFF0F3] text-[#FF385C] text-sm rounded-xl border border-[#FF385C]/20">
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-8">
          {(["stats", "users", "courses"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-[#FF385C] text-white"
                  : "bg-[#F7F7F7] text-[#717171] hover:bg-[#ebebeb]"
              }`}
            >
              {t === "stats" ? "통계" : t === "users" ? "사용자" : "강의"}
            </button>
          ))}
        </div>

        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "전체 사용자", value: `${stats.userCount}명` },
              { label: "전체 강의", value: `${stats.courseCount}개` },
              { label: "수강 신청", value: `${stats.enrollCount}건` },
              { label: "Q&A 질문", value: `${stats.questionCount}건` },
              { label: "결제 완료 금액", value: `${stats.paymentTotal.toLocaleString()}원` },
            ].map((s) => (
              <div key={s.label} className="bg-[#F7F7F7] rounded-2xl p-6">
                <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-3xl font-extrabold text-[#222222]">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#222222]">{u.nickname}</p>
                  <p className="text-sm text-[#717171]">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className="px-3 py-1.5 border border-[#ebebeb] rounded-lg text-sm bg-white"
                >
                  <option value="student">학생</option>
                  <option value="instructor">강사</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-[#717171] py-12 text-sm">사용자 없음</p>
            )}
          </div>
        )}

        {tab === "courses" && (
          <div className="space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#222222]">{c.title}</p>
                  <p className="text-sm text-[#717171]">
                    {c.category} · 강사: {c.instructor_name || "미지정"} · 수강 {c.enroll_count}명
                  </p>
                </div>
                <button
                  onClick={() => deleteCourse(c.id)}
                  className="px-4 py-1.5 bg-[#FF385C] text-white text-sm rounded-full hover:bg-[#e0314f]"
                >
                  삭제
                </button>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-center text-[#717171] py-12 text-sm">강의 없음</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
