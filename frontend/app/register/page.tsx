"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const validate = () => {
    if (!nickname.trim() || nickname.trim().length < 2) return "닉네임은 2자 이상이어야 합니다";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "올바른 이메일 형식이 아닙니다";
    if (!password || password.length < 4) return "비밀번호는 4자 이상이어야 합니다";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, nickname, role }),
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "회원가입 실패");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-sm">
        <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3 text-center">
          DEVFOCUS
        </p>
        <h1
          className="text-3xl font-extrabold text-[#222222] mb-8 text-center"
          style={{ letterSpacing: "-1px" }}
        >
          회원가입
        </h1>
        {error && (
          <div className="mb-5 p-4 bg-[#FFF0F3] border border-[#FF385C]/20 text-[#FF385C] text-sm rounded-xl">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="닉네임 (2자 이상)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
          />
          <input
            type="password"
            placeholder="비밀번호 (4자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
          />
          <div className="flex gap-3">
            {(["student", "instructor"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  role === r
                    ? "border-[#FF385C] bg-[#FFF0F3] text-[#FF385C]"
                    : "border-[#ebebeb] bg-white text-[#717171]"
                }`}
              >
                {r === "student" ? "학생" : "강사"}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-[#222222] text-white py-3 rounded-full font-semibold hover:bg-[#3a3a3a] transition-colors"
          >
            회원가입
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-[#717171]">
          이미 계정이 있나요?{" "}
          <a href="/login" className="text-[#FF385C] font-medium">로그인</a>
        </p>
      </div>
    </div>
  );
}
