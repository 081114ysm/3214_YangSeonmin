import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js"; // default import

export const register = async (req, res) => {
  const { email, password, nickname } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)",
      [email, hashed, nickname]
    );

    res.json({ message: "회원가입 완료" });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 존재하는 이메일입니다" });
    }
    res.status(500).json({ error: "서버 에러" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: "유저 없음" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "비번 틀림" });

    const token = jwt.sign({ id: user.id }, "secret", {
      expiresIn: "1h",
    });

    res.json({ token, nickname: user.nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};