import db from "../config/db.js";

export const getCourses = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = "SELECT * FROM courses WHERE 1=1";
    const params = [];

    if (category && category !== "전체") {
      sql += " AND category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT category FROM courses WHERE category IS NOT NULL");
    const categories = ["전체", ...rows.map(r => r.category)];
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getCourseDetail = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user?.id;

  try {
    const [course] = await db.query("SELECT * FROM courses WHERE id = ?", [courseId]);
    if (!course[0]) return res.status(404).json({ error: "강의 없음" });

    const [lessons] = await db.query(
      "SELECT * FROM lessons WHERE course_id = ? ORDER BY `order` ASC",
      [courseId]
    );

    const [likeCount] = await db.query(
      "SELECT COUNT(*) as count FROM course_likes WHERE course_id = ?",
      [courseId]
    );

    let liked = false;
    let enrolled = false;
    if (userId) {
      const [userLike] = await db.query(
        "SELECT id FROM course_likes WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );
      liked = userLike.length > 0;

      const [userEnroll] = await db.query(
        "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
      );
      enrolled = userEnroll.length > 0;
    }

    const [comments] = await db.query(
      `SELECT c.*, u.nickname FROM course_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.course_id = ? ORDER BY c.created_at DESC`,
      [courseId]
    );

    res.json({
      ...course[0],
      lessons,
      likeCount: likeCount[0].count,
      liked,
      enrolled,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const toggleLike = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const [existing] = await db.query(
      "SELECT id FROM course_likes WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (existing.length > 0) {
      await db.query("DELETE FROM course_likes WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    } else {
      await db.query("INSERT INTO course_likes (user_id, course_id) VALUES (?, ?)", [userId, courseId]);
    }

    const [likeCount] = await db.query(
      "SELECT COUNT(*) as count FROM course_likes WHERE course_id = ?",
      [courseId]
    );

    res.json({ liked: existing.length === 0, likeCount: likeCount[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const addComment = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length < 1) {
    return res.status(400).json({ error: "댓글 내용을 입력하세요" });
  }

  try {
    await db.query(
      "INSERT INTO course_comments (user_id, course_id, content) VALUES (?, ?, ?)",
      [userId, courseId, content.trim()]
    );

    const [comments] = await db.query(
      `SELECT c.*, u.nickname FROM course_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.course_id = ? ORDER BY c.created_at DESC`,
      [courseId]
    );

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const enrollCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    await db.query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );
    res.json({ enrolled: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getMyEnrollments = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT c.*, e.enrolled_at,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM progress p JOIN lessons l ON p.lesson_id = l.id
         WHERE p.user_id = ? AND l.course_id = c.id AND p.watched_seconds > 0) as watched_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`,
      [userId, userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};