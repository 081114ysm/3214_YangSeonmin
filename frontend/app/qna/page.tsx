"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Answer {
  id: number;
  content: string;
  nickname: string;
  created_at: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  nickname: string;
  created_at: string;
  answers?: Answer[];
}

export default function QnAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    api("/qna").then(setQuestions).catch(() => {});
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (title.trim().length < 2) {
      setError("제목은 2자 이상이어야 합니다");
      return;
    }
    if (!content.trim()) {
      setError("내용을 입력해주세요");
      return;
    }
    try {
      await api("/qna", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
      setTitle("");
      setContent("");
      setError("");
      loadQuestions();
    } catch (err: any) {
      setError(err.message || "로그인이 필요합니다");
    }
  };

  const loadDetail = async (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    const data = await api(`/qna/${id}`);
    setDetail(data);
    setSelectedId(id);
  };

  const handleAnswer = async () => {
    if (!answerContent.trim()) {
      alert("답변 내용을 입력해주세요");
      return;
    }
    if (!selectedId) return;
    try {
      await api("/qna/answer", {
        method: "POST",
        body: JSON.stringify({ content: answerContent, questionId: selectedId }),
      });
      setAnswerContent("");
      const data = await api(`/qna/${selectedId}`);
      setDetail(data);
    } catch (err: any) {
      alert(err.message || "로그인이 필요합니다");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F7F7F7] py-16 px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">
            Community
          </p>
          <h1
            className="text-4xl font-extrabold text-[#222222]"
            style={{ letterSpacing: "-1px" }}
          >
            Q&A 게시판
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Write question */}
        <div className="bg-[#F7F7F7] rounded-2xl p-8 mb-8">
          <h2 className="font-extrabold text-[#222222] text-lg mb-5">질문 작성</h2>
          {error && (
            <div className="mb-4 p-4 bg-[#FFF0F3] border border-[#FF385C]/20 text-[#FF385C] text-sm rounded-xl">
              {error}
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (2자 이상)"
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#FF385C] text-sm bg-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={3}
            className="w-full px-4 py-3 border border-[#ebebeb] rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-none text-sm bg-white"
          />
          <button
            onClick={handleSubmit}
            className="px-7 py-2.5 bg-[#FF385C] text-white rounded-full font-medium text-sm hover:bg-[#e0314f] transition-colors"
          >
            등록
          </button>
        </div>

        {/* Question list */}
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id}>
              <div
                onClick={() => loadDetail(q.id)}
                className="bg-[#F7F7F7] rounded-2xl p-6 cursor-pointer hover:bg-[#ebebeb] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#222222] text-base">{q.title}</h3>
                  <span className="text-sm text-[#717171] shrink-0 ml-4">{q.nickname}</span>
                </div>
                <p className="text-[#717171] mt-2 text-sm line-clamp-2">{q.content}</p>
              </div>

              {selectedId === q.id && detail && (
                <div className="bg-white border border-[#F7F7F7] rounded-b-2xl p-6 space-y-4">
                  <p className="text-[#717171] text-sm leading-relaxed">{detail.content}</p>

                  {detail.answers && detail.answers.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-xs text-[#717171] uppercase tracking-wider">
                        답변 {detail.answers.length}개
                      </p>
                      {detail.answers.map((a) => (
                        <div key={a.id} className="bg-[#F7F7F7] rounded-xl p-4">
                          <span className="text-xs font-semibold text-[#222222] block mb-1">
                            {a.nickname}
                          </span>
                          <p className="text-[#717171] text-sm">{a.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      placeholder="답변을 입력하세요"
                      className="flex-1 px-4 py-2.5 border border-[#ebebeb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                    />
                    <button
                      onClick={handleAnswer}
                      className="px-5 py-2.5 bg-[#222222] text-white text-sm rounded-full hover:bg-[#3a3a3a] transition-colors font-medium"
                    >
                      답변
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-[#717171] text-center py-12 text-sm">아직 질문이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}


3