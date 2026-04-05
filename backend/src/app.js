import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import courseRoutes from "./routes/courses.js";
import progressRoutes from "./routes/progress.js";
import focusRoutes from "./routes/focus.js";
import qnaRoutes from "./routes/qna.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/qna", qnaRoutes);

app.listen(3001, () => console.log("server on 3001"));