import db from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const [[{ userCount }]] = await db.query("SELECT COUNT(*) as userCount FROM users");
    const [[{ courseCount }]] = await db.query("SELECT COUNT(*) as courseCount FROM courses");
    const [[{ enrollCount }]] = await db.query("SELECT COUNT(*) as enrollCount FROM enrollments");
    const [[{ questionCount }]] = await db.query("SELECT COUNT(*) as questionCount FROM questions");

    res.json({ userCount, courseCount, enrollCount, questionCount });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, nickname, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["student", "instructor", "admin"].includes(role)) {
    return res.status(400).json({ error: "유효하지 않은 역할입니다" });
  }

  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    res.json({ message: "역할 변경 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: "자기 자신은 삭제할 수 없습니다" });
  }
  try {
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "유저 삭제 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.nickname as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enroll_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};

export const adminDeleteCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    res.json({ message: "강의 삭제 완료" });
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};
