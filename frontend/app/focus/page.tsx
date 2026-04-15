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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Focus
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            집중 타이머
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Timer card */}
        <div className="bg-[#F7F7F7] rounded-3xl p-12 text-center mb-10">
          <div
            className="text-7xl font-mono font-extrabold text-[#222222] mb-4 tracking-tight"
            style={{ letterSpacing: "-2px" }}
          >
            {formatTime(elapsed)}
          </div>
          <p className="text-[#717171] mb-8 text-base">
            {isRunning ? "집중 중..." : "시작 버튼을 눌러 집중을 시작하세요"}
          </p>
          <button
            onClick={isRunning ? handleEnd : handleStart}
            className={`px-10 py-4 rounded-full text-white font-semibold text-base transition-colors ${
              isRunning
                ? "bg-[#FF385C] hover:bg-[#e0314f]"
                : "bg-[#222222] hover:bg-[#3a3a3a]"
            }`}
          >
            {isRunning ? "종료" : "시작"}
          </button>
        </div>

        {/* History */}
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
          History
        </p>
        <h2
          className="text-2xl font-extrabold text-[#222222] mb-6"
          style={{ letterSpacing: "-0.5px" }}
        >
          집중 기록
        </h2>
        <div className="space-y-2">
          {history.map((session) => (
            <div
              key={session.id}
              className="bg-[#F7F7F7] rounded-xl px-6 py-4 flex justify-between items-center"
            >
              <span className="text-[#717171] text-sm">
                {session.start_time
                  ? new Date(session.start_time).toLocaleString("ko-KR")
                  : "방금 전"}
              </span>
              <span className="font-mono font-semibold text-[#222222]">
                {session.duration
                  ? formatTime(Math.round(session.duration))
                  : "-"}
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-[#717171] text-center py-8 text-sm">아직 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
