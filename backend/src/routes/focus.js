import express from 'express';
import { startFocus, endFocus, getHistory } from '../controllers/focus.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', authMiddleware, startFocus);
router.post('/end', authMiddleware, endFocus);
router.get('/history', authMiddleware, getHistory);

export default router;
