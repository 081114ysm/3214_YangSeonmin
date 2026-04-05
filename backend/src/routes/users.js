import express from "express";
import { getMe, updateMe } from "../controllers/users.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateNickname } from "../middleware/validate.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, validateNickname, updateMe);

export default router;
