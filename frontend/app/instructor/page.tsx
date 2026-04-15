"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  enroll_count: number;
  lesson_count: number;
}

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  order: number;
  duration: number;
}

const CATEGORIES = ["프론트엔드", "백엔드", "모바일", "DevOps", "데이터", "기타"];

export default function InstructorPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "프론트엔드", thumbnail: "" });
  const [lessonForm, setLessonForm] = useState({ title: "", video_url: "", order: "1", duration: "600" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "instructor" && role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadCourses();
  }, [router]);

  const loadCourses = () =>
    api("/instructor/courses").then(setCourses).catch(() => {});

  const loadLessons = (courseId: number) =>
    api(`/courses/${courseId}`).then((d) => setLessons(d.lessons || [])).catch(() => {});

  const selectCourse = (c: Course) => {
    setSelected(c);
    loadLessons(c.id);
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/instructor/courses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("강의 생성 완료");
      setShowForm(false);
      setForm({ title: "", description: "", category: "프론트엔드", thumbnail: "" });
      loadCourses();
    } catch (err: any) {
      setMessage(err.message || "생성 실패");
    }
  };

  const deleteCourse = async (courseId: number) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    try {
      await api(`/instructor/courses/${courseId}`, { method: "DELETE" });
      setMessage("강의 삭제 완료");
      setSelected(null);
      loadCourses();
    } catch {
      setMessage("삭제 실패");
    }
  };

  const addLesson = async (e: React.FormEvent) => {
    if (!selected) return;
    e.preventDefault();
    try {
      await api(`/instructor/courses/${selected.id}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          ...lessonForm,
          order: parseInt(lessonForm.order),
          duration: parseInt(lessonForm.duration),
        }),
      });
      setMessage("레슨 추가 완료");
      setLessonForm({ title: "", video_url: "", order: "1", duration: "600" });
      loadLessons(selected.id);
    } catch (err: any) {
      setMessage(err.message || "추가 실패");
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!selected || !confirm("레슨을 삭제하시겠습니까?")) return;
    try {
      await api(`/instructor/courses/${selected.id}/lessons/${lessonId}`, { method: "DELETE" });
      loadLessons(selected.id);
    } catch {
      setMessage("삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#222222] py-16 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#FF385C] text-xs font-extrabold tracking-[3px] uppercase mb-3">Instructor</p>
          <h1 className="text-4xl font-extrabold text-white" style={{ letterSpacing: "-1px" }}>강사 대시보드</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {message && (
          <div className="mb-4 p-3 bg-[#FFF0F3] text-[#FF385C] text-sm rounded-xl border border-[#FF385C]/20">
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-[#222222]">내 강의 목록</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 bg-[#FF385C] text-white rounded-full text-sm font-semibold hover:bg-[#e0314f]"
          >
            + 새 강의
          </button>
        </div>

        {showForm && (
          <form onSubmit={createCourse} className="bg-[#F7F7F7] rounded-2xl p-6 mb-6 space-y-3">
            <h3 className="font-bold text-[#222222] mb-2">새 강의 만들기</h3>
            <input
              placeholder="강의 제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
              required
            />
            <textarea
              placeholder="강의 설명"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white h-20"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-5 py-2 bg-[#FF385C] text-white rounded-full text-sm font-semibold hover:bg-[#e0314f]">
                생성
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-[#ebebeb] text-[#717171] rounded-full text-sm font-semibold">
                취소
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => selectCourse(c)}
              className={`rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                selected?.id === c.id ? "border-[#FF385C] bg-[#FFF0F3]" : "border-transparent bg-[#F7F7F7] hover:border-[#ebebeb]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#222222]">{c.title}</p>
                  <p className="text-sm text-[#717171] mt-1">{c.category} · 레슨 {c.lesson_count}개 · 수강 {c.enroll_count}명</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCourse(c.id); }}
                  className="text-[#FF385C] text-xs hover:underline ml-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-[#717171] text-sm col-span-2 text-center py-8">아직 강의가 없습니다</p>
          )}
        </div>

        {selected && (
          <div>
            <h3 className="text-xl font-extrabold text-[#222222] mb-4">
              {selected.title} — 레슨 관리
            </h3>
            <div className="space-y-2 mb-6">
              {lessons.map((l) => (
                <div key={l.id} className="bg-[#F7F7F7] rounded-xl px-5 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-[#222222]">{l.order}. {l.title}</span>
                  <button onClick={() => deleteLesson(l.id)} className="text-[#FF385C] text-xs hover:underline">삭제</button>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-sm text-[#717171] text-center py-4">레슨 없음</p>}
            </div>

            <form onSubmit={addLesson} className="bg-[#F7F7F7] rounded-2xl p-6 space-y-3">
              <h4 className="font-bold text-[#222222]">레슨 추가</h4>
              <input
                placeholder="레슨 제목"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                required
              />
              <input
                placeholder="영상 URL (YouTube 등)"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                className="w-full px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
              />
              <div className="flex gap-3">
                <input
                  placeholder="순서"
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                  className="w-24 px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                />
                <input
                  placeholder="길이(초)"
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  className="w-28 px-4 py-2 border border-[#ebebeb] rounded-xl text-sm bg-white"
                />
                <button type="submit" className="px-5 py-2 bg-[#FF385C] text-white rounded-full text-sm font-semibold hover:bg-[#e0314f]">
                  추가
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
