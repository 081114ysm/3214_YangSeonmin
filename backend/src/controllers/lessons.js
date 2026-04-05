import db from "../config/db.js";

export const getLessonDetail = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT l.*, c.title AS course_title
       FROM lessons l
       JOIN courses c ON l.course_id = c.id
       WHERE l.id = ?`,
      [lessonId]
    );

    if (!rows[0]) return res.status(404).json({ error: "강의 영상을 찾을 수 없습니다" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};
