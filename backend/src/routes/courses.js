import express from "express";
import { getCourses, getCourseDetail } from "../controllers/courses.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/:courseId", getCourseDetail);

export default router;