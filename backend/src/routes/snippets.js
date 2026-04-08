import express from "express";
import { getSnippets, createSnippet, deleteSnippet, getLanguages } from "../controllers/snippets.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getSnippets);
router.get("/languages", getLanguages);
router.post("/", createSnippet);
router.delete("/:id", deleteSnippet);

export default router;
