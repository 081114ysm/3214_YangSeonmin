"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, logout } from "@/lib/api";

export default function Navbar() {
  const [nickname, setNickname] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/users/me")
        .then((user) => setNickname(user.nickname))
        .catch(() => {
          localStorage.removeItem("token");
          setNickname(null);
        });
    } else {
      setNickname(null);
    }
  }, [pathname]);

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          DevFocus
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/courses" className="hover:text-blue-600 transition">
            강의
          </Link>
          <Link href="/focus" className="hover:text-blue-600 transition">
            집중 타이머
          </Link>
          <Link href="/qna" className="hover:text-blue-600 transition">
            Q&A
          </Link>
          <Link href="/snippets" className="hover:text-blue-600 transition">
            코드 스니펫
          </Link>
          {nickname ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-600 transition">
                대시보드
              </Link>
              <Link href="/mypage" className="hover:text-blue-600 transition">
                마이페이지
              </Link>
              <span className="text-blue-600 font-semibold">{nickname}님</span>
              <button
                onClick={logout}
                className="px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
