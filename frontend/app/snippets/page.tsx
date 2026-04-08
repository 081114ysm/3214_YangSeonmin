"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  memo: string | null;
  created_at: string;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "c",
  "cpp",
  "html",
  "css",
  "sql",
  "bash",
  "etc",
];

export default function SnippetsPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filterLang, setFilterLang] = useState("전체");
  const [languages, setLanguages] = useState<string[]>(["전체"]);

  // 작성 폼
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [memo, setMemo] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadSnippets();
    loadLanguages();
  }, [router]);

  useEffect(() => {
    loadSnippets();
  }, [filterLang]);

  const loadSnippets = () => {
    const params = filterLang !== "전체" ? `?language=${encodeURIComponent(filterLang)}` : "";
    api(`/snippets${params}`).then(setSnippets).catch(() => {});
  };

  const loadLanguages = () => {
    api("/snippets/languages").then(setLanguages).catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    try {
      await api("/snippets", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), code, language, memo: memo.trim() }),
      });
      setTitle("");
      setCode("");
      setMemo("");
      setLanguage("javascript");
      setShowForm(false);
      loadSnippets();
      loadLanguages();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await api(`/snippets/${id}`, { method: "DELETE" });
      loadSnippets();
      loadLanguages();
    } catch {}
  };

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">코드 스니펫</h1>
            <p className="text-gray-500 mt-1">학습하면서 유용한 코드를 저장하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              showForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {showForm ? "취소" : "+ 새 스니펫"}
          </button>
        </div>

        {/* 작성 폼 */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목 (예: React useEffect 패턴)"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드를 입력하세요..."
              rows={8}
              className="w-full border rounded-lg px-4 py-3 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택사항 - 이 코드가 왜 유용한지, 어디서 배웠는지 등)"
              rows={2}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              저장
            </button>
          </form>
        )}

        {/* 언어 필터 */}
        <div className="flex gap-2 flex-wrap mb-6">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filterLang === lang
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* 스니펫 목록 */}
        {snippets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">저장된 스니펫이 없습니다</p>
            <p className="text-gray-400 text-sm">학습하면서 유용한 코드를 저장해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-800 text-green-400 text-xs font-mono px-2 py-0.5 rounded">
                      {snippet.language}
                    </span>
                    <h3 className="font-semibold">{snippet.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(snippet.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    <button
                      onClick={() => handleCopy(snippet.id, snippet.code)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                    >
                      {copiedId === snippet.id ? "복사됨!" : "복사"}
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="px-3 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 text-sm font-mono overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
                {snippet.memo && (
                  <div className="px-5 py-3 bg-gray-50 text-sm text-gray-600 border-t">
                    {snippet.memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
