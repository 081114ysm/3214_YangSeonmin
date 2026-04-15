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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
              Snippets
            </p>
            <h1
              className="text-4xl font-extrabold text-[#222222]"
              style={{ letterSpacing: "-1px" }}
            >
              코드 스니펫
            </h1>
            <p className="text-[#717171] mt-2 text-sm">학습하면서 유용한 코드를 저장하세요</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${
              showForm
                ? "bg-[#F7F7F7] text-[#717171] hover:bg-[#ebebeb] border border-[#ebebeb]"
                : "bg-[#FF385C] text-white hover:bg-[#e0314f]"
            }`}
          >
            {showForm ? "취소" : "+ 새 스니펫"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[#F7F7F7] rounded-2xl p-8 mb-8 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목 (예: React useEffect 패턴)"
                className="flex-1 border border-[#ebebeb] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm bg-white"
                required
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-[#ebebeb] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm bg-white"
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
              className="w-full border border-[#ebebeb] rounded-xl px-4 py-3 font-mono text-sm bg-[#222222] text-[#4ade80] focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              required
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 (선택사항 - 이 코드가 왜 유용한지, 어디서 배웠는지 등)"
              rows={2}
              className="w-full border border-[#ebebeb] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm bg-white"
            />
            <button
              type="submit"
              className="px-7 py-2.5 bg-[#FF385C] text-white rounded-full font-medium text-sm hover:bg-[#e0314f] transition-colors"
            >
              저장
            </button>
          </form>
        )}

        {/* Language filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLang(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterLang === lang
                  ? "bg-[#FF385C] text-white"
                  : "bg-[#F7F7F7] text-[#717171] hover:bg-[#ebebeb]"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Snippet list */}
        {snippets.length === 0 ? (
          <div className="bg-[#F7F7F7] rounded-2xl p-10 text-center">
            <p className="text-[#717171] text-base mb-2">저장된 스니펫이 없습니다</p>
            <p className="text-[#717171] text-sm">학습하면서 유용한 코드를 저장해보세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="bg-[#F7F7F7] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#222222] text-[#4ade80] text-xs font-mono px-2.5 py-1 rounded-lg">
                      {snippet.language}
                    </span>
                    <h3 className="font-semibold text-[#222222]">{snippet.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#717171]">
                      {new Date(snippet.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    <button
                      onClick={() => handleCopy(snippet.id, snippet.code)}
                      className="px-3 py-1.5 text-xs bg-white text-[#717171] rounded-lg hover:bg-[#ebebeb] transition-colors font-medium"
                    >
                      {copiedId === snippet.id ? "복사됨" : "복사"}
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="px-3 py-1.5 text-xs bg-[#FFF0F3] text-[#FF385C] rounded-lg hover:bg-[#ffe0e6] transition-colors font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <pre className="bg-[#222222] text-[#4ade80] px-6 py-5 text-sm font-mono overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
                {snippet.memo && (
                  <div className="px-6 py-4 text-sm text-[#717171] border-t border-[#ebebeb]">
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
