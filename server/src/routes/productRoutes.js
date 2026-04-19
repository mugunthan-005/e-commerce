import { Router } from "express";
import { createProduct, listProducts, restockProduct } from "../controllers/productController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.post("/", requireAuth, requireAdmin, createProduct);
router.patch("/:id/restock", requireAuth, requireAdmin, restockProduct);

export default router;