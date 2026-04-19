import { Router } from "express";
import { placeOrder } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAuth, placeOrder);

export default router;