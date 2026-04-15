"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) return "이메일을 입력해주세요";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "올바른 이메일 형식이 아닙니다";
    if (!password) return "비밀번호를 입력해주세요";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role || "student");
      localStorage.setItem("nickname", data.nickname || "");

      if (data.role === "admin") router.push("/admin");
      else if (data.role === "instructor") router.push("/instructor");
      else router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "로그인 실패");
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
          로그인
        </h1>
        {error && (
          <div className="mb-5 p-4 bg-[#FFF0F3] border border-[#FF385C]/20 text-[#FF385C] text-sm rounded-xl">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm"
          />
          <button
            type="submit"
            className="w-full bg-[#FF385C] text-white py-3 rounded-full font-semibold hover:bg-[#e0314f] transition-colors"
          >
            로그인
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-[#717171]">
          계정이 없나요?{" "}
          <a href="/register" className="text-[#FF385C] font-medium">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
