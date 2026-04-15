import db from "../config/db.js";
import logger from "../config/logger.js";
import { sendEnrollmentEmail } from "../services/email.js";

// 강의 가격 (실제 결제 모듈 연동 전 mock)
const COURSE_PRICES = { default: 29900 };

export const initiatePayment = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  try {
    const [courses] = await db.query("SELECT * FROM courses WHERE id = ?", [courseId]);
    if (!courses[0]) return res.status(404).json({ error: "강의 없음" });

    const [existing] = await db.query(
      "SELECT id FROM payments WHERE user_id=? AND course_id=? AND status='completed'",
      [userId, courseId]
    );
    if (existing[0]) return res.status(409).json({ error: "이미 결제된 강의입니다" });

    const amount = COURSE_PRICES[courseId] || COURSE_PRICES.default;
    const paymentKey = `pay_${Date.now()}_${userId}_${courseId}`;

    const [result] = await db.query(
      "INSERT INTO payments (user_id, course_id, amount, payment_key, status) VALUES (?, ?, ?, ?, 'pending')",
      [userId, courseId, amount, paymentKey]
    );

    res.json({ paymentId: result.insertId, paymentKey, amount, courseTitle: courses[0].title });
  } catch (err) {
    logger.error("결제 초기화 실패", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const confirmPayment = async (req, res) => {
  const userId = req.user.id;
  const { paymentId, paymentKey } = req.body;

  try {
    const [payments] = await db.query(
      "SELECT * FROM payments WHERE id=? AND user_id=? AND payment_key=?",
      [paymentId, userId, paymentKey]
    );
    if (!payments[0]) return res.status(404).json({ error: "결제 정보 없음" });
    if (payments[0].status !== "pending") {
      return res.status(400).json({ error: "처리할 수 없는 결제 상태" });
    }

    await db.query("UPDATE payments SET status='completed' WHERE id=?", [paymentId]);
    await db.query(
      "INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, payments[0].course_id]
    );

    const [users] = await db.query("SELECT email, nickname FROM users WHERE id=?", [userId]);
    const [courses] = await db.query("SELECT title FROM courses WHERE id=?", [payments[0].course_id]);
    if (users[0] && courses[0]) {
      await sendEnrollmentEmail(users[0].email, users[0].nickname, courses[0].title);
    }

    logger.info("결제 완료", { userId, paymentId, courseId: payments[0].course_id });
    res.json({ message: "결제 완료", enrolled: true });
  } catch (err) {
    logger.error("결제 확인 실패", { error: err.message });
    res.status(500).json({ error: "서버 에러" });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.title as course_title
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
};
