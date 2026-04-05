import db from "../config/db.js";

export const createQuestion = async (req, res) => {
  const { title, content } = req.body;

  try {
    await db.query(
      "INSERT INTO questions (user_id, title, content) VALUES (?, ?, ?)",
      [req.user.id, title, content]
    );
    res.json({ message: "작성 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.*, u.nickname
       FROM questions q
       JOIN users u ON q.user_id = u.id
       ORDER BY q.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const [q] = await db.query(
      `SELECT q.*, u.nickname
       FROM questions q
       JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [id]
    );

    if (!q[0]) return res.status(404).json({ error: "질문 없음" });

    const [a] = await db.query(
      `SELECT a.*, u.nickname
       FROM answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = ?
       ORDER BY a.created_at ASC`,
      [id]
    );

    res.json({ ...q[0], answers: a });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const createAnswer = async (req, res) => {
  const { content, questionId } = req.body;

  try {
    await db.query(
      "INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)",
      [questionId, req.user.id, content]
    );
    res.json({ message: "답변 등록" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};
