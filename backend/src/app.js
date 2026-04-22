import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

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

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error("Unhandled error", err.message);
  res.status(500).json({ error: "서버 에러" });
});

app.listen(PORT, () => console.log(`서버 시작 - 포트 ${PORT}`));
