import db from "../config/db.js";

export const getSnippets = async (req, res) => {
  const userId = req.user.id;
  const { language } = req.query;

  try {
    let sql = "SELECT * FROM code_snippets WHERE user_id = ?";
    const params = [userId];

    if (language && language !== "전체") {
      sql += " AND language = ?";
      params.push(language);
    }

    sql += " ORDER BY created_at DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const createSnippet = async (req, res) => {
  const userId = req.user.id;
  const { title, code, language, memo } = req.body;

  if (!title || !code || !language) {
    return res.status(400).json({ error: "제목, 코드, 언어는 필수입니다" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO code_snippets (user_id, title, code, language, memo) VALUES (?, ?, ?, ?, ?)",
      [userId, title.trim(), code, language, memo?.trim() || null]
    );
    const [snippet] = await db.query("SELECT * FROM code_snippets WHERE id = ?", [result.insertId]);
    res.json(snippet[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const deleteSnippet = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await db.query("DELETE FROM code_snippets WHERE id = ? AND user_id = ?", [id, userId]);
    res.json({ message: "삭제 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getLanguages = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT DISTINCT language FROM code_snippets WHERE user_id = ? ORDER BY language",
      [userId]
    );
    res.json(["전체", ...rows.map((r) => r.language)]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 에러" });
  }
};
