import db from '../config/db.js';

export const startFocus = async (req, res) => {
  const userId = req.user.id;
  const startTime = new Date();

  try {
    const [result] = await db.query(
      'INSERT INTO focus_sessions (user_id, start_time) VALUES (?, ?)',
      [userId, startTime]
    );
    res.json({ sessionId: result.insertId, startTime });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

export const endFocus = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.body;
  const endTime = new Date();

  try {
    const [session] = await db.query(
      'SELECT start_time FROM focus_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session[0]) return res.status(404).json({ error: '세션 없음' });

    const duration = (endTime - session[0].start_time) / 1000; // 초 단위

    await db.query(
      'UPDATE focus_sessions SET end_time = ?, duration = ? WHERE id = ?',
      [endTime, duration, sessionId]
    );

    res.json({ sessionId, endTime, duration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};

export const getHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY start_time DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 에러' });
  }
};