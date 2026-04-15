"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, logout } from "@/lib/api";

export default function Navbar() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api("/users/me")
        .then((user) => {
          setNickname(user.nickname);
          setRole(localStorage.getItem("role"));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setNickname(null);
          setRole(null);
        });
    } else {
      setNickname(null);
      setRole(null);
    }
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    `hover:text-[#FF385C] transition-colors ${isActive(href) ? "text-[#FF385C] font-semibold" : ""}`;

  return (
    <nav className="bg-white border-b border-[#F7F7F7] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-[#FF385C]">
          DEVFOCUS
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-[#222222]">
          <Link href="/courses" className={linkClass("/courses")}>강의</Link>
          <Link href="/focus" className={linkClass("/focus")}>집중 타이머</Link>
          <Link href="/qna" className={linkClass("/qna")}>Q&A</Link>
          <Link href="/snippets" className={linkClass("/snippets")}>코드 스니펫</Link>

          {nickname ? (
            <>
              {role === "admin" && (
                <Link href="/admin" className={linkClass("/admin")}>관리자</Link>
              )}
              {(role === "instructor" || role === "admin") && (
                <Link href="/instructor" className={linkClass("/instructor")}>강사</Link>
              )}
              <Link href="/dashboard" className={linkClass("/dashboard")}>대시보드</Link>
              <Link href="/mypage" className={linkClass("/mypage")}>마이페이지</Link>
              <span className="text-[#FF385C] font-semibold">{nickname}님</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-[#F7F7F7] text-[#222222] rounded-full text-sm font-medium hover:bg-[#ebebeb] transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 bg-[#FF385C] text-white rounded-full text-sm font-medium hover:bg-[#e0314f] transition-colors">
                로그인
              </Link>
              <Link href="/register" className="px-4 py-2 bg-[#222222] text-white rounded-full text-sm font-medium hover:bg-[#3a3a3a] transition-colors">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
