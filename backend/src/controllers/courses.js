import db from "../config/db.js"; // default import

export const getCourses = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM courses");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getCourseDetail = async (req, res) => {
  const { courseId } = req.params;

  try {
    const [course] = await db.query(
      "SELECT * FROM courses WHERE id = ?",
      [courseId]
    );

    if (!course[0]) return res.status(404).json({ error: "강의 없음" });

    const [lessons] = await db.query(
      "SELECT * FROM lessons WHERE course_id = ? ORDER BY `order` ASC",
      [courseId]
    );

    res.json({ ...course[0], lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};