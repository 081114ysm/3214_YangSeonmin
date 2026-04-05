import db from '../config/db.js'; // MySQL 연결 모듈

export const saveProgress = async (req, res) => {
  const { lessonId, watchedSeconds } = req.body;
  const userId = req.user.id; // JWT 미들웨어 적용 필요

  try {
    await db.query(
      'INSERT INTO progress (user_id, lesson_id, watched_seconds) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE watched_seconds = ?',
      [userId, lessonId, watchedSeconds, watchedSeconds]
    );
    res.json({ message: '진도 저장 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

export const getProgress = async (req, res) => {
  const userId = req.user.id;
  const courseId = req.params.courseId;

  try {
    const [rows] = await db.query(
      `SELECT p.*, l.title 
       FROM progress p
       JOIN lessons l ON p.lesson_id = l.id
       WHERE p.user_id = ? AND l.course_id = ?`,
      [userId, courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};