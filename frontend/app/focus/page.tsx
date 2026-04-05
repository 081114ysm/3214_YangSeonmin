"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

interface FocusSession {
  id: number;
  start_time: string;
  end_time: string | null;
  duration: number | null;
}

export default function FocusPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<FocusSession[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api("/focus/history")
      .then(setHistory)
      .catch(() => {});

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStart = async () => {
    try {
      const res = await api("/focus/start", { method: "POST" });
      setSessionId(res.sessionId);
      setIsRunning(true);
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("로그인이 필요합니다");
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    try {
      const res = await api("/focus/end", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setHistory((prev) => [
        { id: sessionId, start_time: "", end_time: res.endTime, duration: res.duration },
        ...prev,
      ]);
      setSessionId(null);
    } catch {
      alert("종료 실패");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">집중 타이머</h1>

        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-6">
            {formatTime(elapsed)}
          </div>
          <p className="text-gray-500 mb-6">
            {isRunning ? "집중 중..." : "시작 버튼을 눌러 집중을 시작하세요"}
          </p>
          <button
            onClick={isRunning ? handleEnd : handleStart}
            className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition ${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isRunning ? "종료" : "시작"}
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">집중 기록</h2>
        <div className="space-y-3">
          {history.map((session) => (
            <div
              key={session.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <span className="text-gray-600 text-sm">
                {session.start_time
                  ? new Date(session.start_time).toLocaleString("ko-KR")
                  : "방금 전"}
              </span>
              <span className="font-mono font-semibold">
                {session.duration
                  ? formatTime(Math.round(session.duration))
                  : "-"}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-gray-400 text-center py-4">아직 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
