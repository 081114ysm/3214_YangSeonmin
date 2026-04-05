import express from "express";
import {
  createQuestion,
  getQuestions,
  getDetail,
  createAnswer,
} from "../controllers/qna.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateQuestion, validateAnswer } from "../middleware/validate.js";

const router = express.Router();

router.get("/", getQuestions);
router.post("/", authMiddleware, validateQuestion, createQuestion);
router.get("/:id", getDetail);
router.post("/answer", authMiddleware, validateAnswer, createAnswer);

export default router;
