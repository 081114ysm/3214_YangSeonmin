import express from "express";
import {
  createQuestion,
  getQuestions,
  getDetail,
  createAnswer,
} from "../controllers/qna.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getQuestions);
router.post("/", authMiddleware, createQuestion);
router.get("/:id", getDetail);
router.post("/answer", authMiddleware, createAnswer);

export default router;