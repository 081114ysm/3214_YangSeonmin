"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  nickname: string;
}

interface FocusSession {
  id: number;
  start_time: string;
  end_time: string;
  duration: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [focusHistory, setFocusHistory] = useState<FocusSession[]>([]);
  const [totalFocus, setTotalFocus] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api("/users/me")
      .then(setUser)
      .catch(() => router.push("/login"));

    api("/focus/history")
      .then((data) => {
        setFocusHistory(data.slice(0, 5));
        const total = data.reduce(
          (sum: number, s: FocusSession) => sum + (s.duration || 0),
          0
        );
        setTotalFocus(total);
      })
      .catch(() => {});
  }, [router]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!user) return <p className="p-8 text-[#717171]">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Dashboard
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            대시보드
          </h1>
          <p className="text-[#717171] mt-2">
            안녕하세요,{" "}
            <span className="font-semibold text-[#FF385C]">{user.nickname}</span>님
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              총 집중 시간
            </p>
            <p className="text-4xl font-extrabold text-[#FF385C]">
              {formatTime(Math.round(totalFocus))}
            </p>
          </div>
          <div className="bg-[#F7F7F7] rounded-2xl p-8">
            <p className="text-xs font-extrabold text-[#717171] uppercase tracking-widest mb-3">
              집중 세션 수
            </p>
            <p className="text-4xl font-extrabold text-[#222222]">
              {focusHistory.length}회
            </p>
          </div>
        </div>

        {/* Recent sessions */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          History
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          최근 집중 기록
        </h2>
        <div className="space-y-2">
          {focusHistory.map((session) => (
            <div
              key={session.id}
              className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex justify-between items-center"
            >
              <span className="text-[#717171] text-sm">
                {new Date(session.start_time).toLocaleString("ko-KR")}
              </span>
              <span className="font-mono font-semibold text-[#222222]">
                {session.duration ? formatTime(Math.round(session.duration)) : "-"}
              </span>
            </div>
          ))}
          {focusHistory.length === 0 && (
            <p className="text-[#717171] text-center py-8 text-sm">아직 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
