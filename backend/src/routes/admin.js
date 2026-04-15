import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  adminDeleteCourse,
} from "../controllers/admin.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);
router.get("/courses", getAllCourses);
router.delete("/courses/:courseId", adminDeleteCourse);

export default router;
