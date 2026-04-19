import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";

export const placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    for (const it of items) {
      if (!it?.productId || !Number.isInteger(it.quantity) || it.quantity <= 0) {
        return res.status(400).json({ message: "Invalid order items" });
      }
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const productIds = items.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } }).session(session);
      const map = new Map(products.map((p) => [String(p._id), p]));

      for (const it of items) {
        const p = map.get(String(it.productId));
        if (!p) {
          const err = new Error(`Product not found: ${it.productId}`);
          err.statusCode = 404;
          throw err;
        }
        if (p.stockQuantity < it.quantity) {
          const err = new Error(`Insufficient stock for "${p.name}"`);
          err.statusCode = 400;
          throw err;
        }
      }

      for (const it of items) {
        const p = map.get(String(it.productId));
        p.stockQuantity -= it.quantity;
        await p.save({ session });
      }

      const totalPrice = items.reduce((sum, it) => {
        const p = map.get(String(it.productId));
        return sum + p.price * it.quantity;
      }, 0);

      createdOrder = await Order.create(
        [
          {
            user: userId,
            items: items.map((it) => ({ product: it.productId, quantity: it.quantity })),
            totalPrice,
            status: "placed"
          }
        ],
        { session }
      );

      createdOrder = createdOrder[0];
    });

    res.status(201).json({ order: createdOrder });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
};