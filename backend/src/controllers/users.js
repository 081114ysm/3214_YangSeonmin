import db from "../config/db.js";

export const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, nickname FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ error: "유저 없음" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const updateMe = async (req, res) => {
  const { nickname } = req.body;

  try {
    await db.query(
      "UPDATE users SET nickname = ? WHERE id = ?",
      [nickname, req.user.id]
    );
    res.json({ message: "수정 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};
