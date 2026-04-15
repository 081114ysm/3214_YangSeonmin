import express from "express";
import jwt from "jsonwebtoken";
import {
  getCourses,
  getCategories,
  getCourseDetail,
  toggleLike,
  addComment,
  enrollCourse,
  getMyEnrollments,
} from "../controllers/courses.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "devfocus_secret_key");
    } catch {}
  }
  next();
};

router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/my", authMiddleware, getMyEnrollments);
router.get("/:courseId", optionalAuth, getCourseDetail);
router.post("/:courseId/like", authMiddleware, toggleLike);
router.post("/:courseId/comment", authMiddleware, addComment);
router.post("/:courseId/enroll", authMiddleware, enrollCourse);

export default router;