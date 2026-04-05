import express from "express";
import { getLessonDetail } from "../controllers/lessons.js";

const router = express.Router();

router.get("/:lessonId", getLessonDetail);

export default router;
