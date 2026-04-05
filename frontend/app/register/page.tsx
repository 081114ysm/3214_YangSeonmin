"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!nickname.trim()) return "닉네임을 입력해주세요";
    if (nickname.trim().length < 2) return "닉네임은 2자 이상이어야 합니다";
    if (!email.trim()) return "이메일을 입력해주세요";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "올바른 이메일 형식이 아닙니다";
    if (!password) return "비밀번호를 입력해주세요";
    if (password.length < 4) return "비밀번호는 4자 이상이어야 합니다";
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
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, nickname }),
      });
      alert("회원가입 성공!");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "회원가입 실패");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="닉네임 (2자 이상)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호 (4자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
            회원가입
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          이미 계정이 있나요? <a href="/login" className="text-blue-500">로그인</a>
        </p>
      </div>
    </div>
  );
}
