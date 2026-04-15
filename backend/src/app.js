import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import logger from "./config/logger.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import progressRoutes from "./routes/progress.js";
import focusRoutes from "./routes/focus.js";
import qnaRoutes from "./routes/qna.js";
import lessonRoutes from "./routes/lessons.js";
import snippetRoutes from "./routes/snippets.js";
import adminRoutes from "./routes/admin.js";
import instructorRoutes from "./routes/instructor.js";
import paymentRoutes from "./routes/payment.js";
import { startScheduler } from "./services/scheduler.js";

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// 보안 헤더
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 200,
  message: { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "로그인 시도가 너무 많습니다." },
});

app.use(limiter);
app.use(express.json({ limit: "1mb" }));

// 구조화 로깅 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("HTTP", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/payments", paymentRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "서버 에러" });
});

// 스케줄러 시작
if (process.env.NODE_ENV !== "test") {
  startScheduler();
}

app.listen(PORT, () => logger.info(`서버 시작 - 포트 ${PORT}`));
