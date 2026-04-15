import db from "../config/db.js";

export const getMyCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enroll_count,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
       FROM courses c
       WHERE c.instructor_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const createCourse = async (req, res) => {
  const { title, description, thumbnail, category } = req.body;
  if (!title) return res.status(400).json({ error: "제목을 입력하세요" });

  try {
    const [result] = await db.query(
      "INSERT INTO courses (title, description, thumbnail, category, instructor_id) VALUES (?, ?, ?, ?, ?)",
      [title, description || "", thumbnail || "", category || "기타", req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: "강의 생성 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateMyCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, thumbnail, category } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!rows[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query(
      "UPDATE courses SET title=?, description=?, thumbnail=?, category=? WHERE id=?",
      [title, description, thumbnail, category, courseId]
    );
    res.json({ message: "강의 수정 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteMyCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!rows[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    res.json({ message: "강의 삭제 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const addLesson = async (req, res) => {
  const { courseId } = req.params;
  const { title, video_url, order, duration } = req.body;
  if (!title) return res.status(400).json({ error: "레슨 제목을 입력하세요" });

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    const [result] = await db.query(
      "INSERT INTO lessons (course_id, title, video_url, `order`, duration) VALUES (?, ?, ?, ?, ?)",
      [courseId, title, video_url || "", order || 0, duration || 0]
    );
    res.status(201).json({ id: result.insertId, message: "레슨 추가 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { title, video_url, order, duration } = req.body;

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query(
      "UPDATE lessons SET title=?, video_url=?, `order`=?, duration=? WHERE id=? AND course_id=?",
      [title, video_url, order, duration, lessonId, courseId]
    );
    res.json({ message: "레슨 수정 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const [owner] = await db.query(
      "SELECT id FROM courses WHERE id = ? AND instructor_id = ?",
      [courseId, req.user.id]
    );
    if (!owner[0]) return res.status(403).json({ error: "권한 없음" });

    await db.query("DELETE FROM lessons WHERE id = ? AND course_id = ?", [lessonId, courseId]);
    res.json({ message: "레슨 삭제 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};
