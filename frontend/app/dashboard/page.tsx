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
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  };

  if (!user) return <p className="p-8 text-gray-500">로딩 중...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600 mb-8">
          안녕하세요, <span className="font-semibold text-blue-600">{user.nickname}</span>님!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">총 집중 시간</h2>
            <p className="text-3xl font-bold text-blue-600">
              {formatTime(Math.round(totalFocus))}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-2">집중 세션 수</h2>
            <p className="text-3xl font-bold text-green-600">
              {focusHistory.length}회
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">최근 집중 기록</h2>
        <div className="space-y-3">
          {focusHistory.map((session) => (
            <div
              key={session.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span className="text-gray-600 text-sm">
                {new Date(session.start_time).toLocaleString("ko-KR")}
              </span>
              <span className="font-mono font-semibold">
                {session.duration ? formatTime(Math.round(session.duration)) : "-"}
              </span>
            </div>
          ))}
          {focusHistory.length === 0 && (
            <p className="text-gray-400 text-center py-4">아직 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
