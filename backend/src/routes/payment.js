import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { initiatePayment, confirmPayment, getMyPayments } from "../controllers/payment.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/initiate", initiatePayment);
router.post("/confirm", confirmPayment);
router.get("/my", getMyPayments);

export default router;
