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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Q&A 게시판</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">질문 작성</h2>
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (2자 이상)"
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={3}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            등록
          </button>
        </div>

        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id}>
              <div
                onClick={() => loadDetail(q.id)}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{q.title}</h3>
                  <span className="text-sm text-gray-400">{q.nickname}</span>
                </div>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">{q.content}</p>
              </div>

              {selectedId === q.id && detail && (
                <div className="bg-gray-100 rounded-b-lg p-4 mt-1 space-y-3">
                  <p className="text-gray-700">{detail.content}</p>

                  {detail.answers && detail.answers.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-gray-500">
                        답변 {detail.answers.length}개
                      </p>
                      {detail.answers.map((a) => (
                        <div key={a.id} className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>{a.nickname}</span>
                          </div>
                          <p className="text-gray-700">{a.content}</p>
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
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={handleAnswer}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                    >
                      답변
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-gray-400 text-center py-8">아직 질문이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
