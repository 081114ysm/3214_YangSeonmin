"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

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
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-600 transition">
                대시보드
              </Link>
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
