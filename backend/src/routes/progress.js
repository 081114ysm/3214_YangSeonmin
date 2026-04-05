import express from 'express';
import { saveProgress, getProgress } from '../controllers/progress.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateProgress } from '../middleware/validate.js';

const router = express.Router();

router.post('/', authMiddleware, validateProgress, saveProgress);
router.get('/:courseId', authMiddleware, getProgress);

export default router;
