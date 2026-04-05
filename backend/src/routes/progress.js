import express from 'express';
import { saveProgress, getProgress } from '../controllers/progress.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, saveProgress);
router.get('/:courseId', authMiddleware, getProgress);

export default router;
