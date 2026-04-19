import Product from "../models/ProductModel.js";

export const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (e) {
    next(e);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price, stockQuantity, minStockThreshold } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const product = await Product.create({
      name,
      price,
      stockQuantity: stockQuantity ?? 0,
      minStockThreshold: minStockThreshold ?? 0
    });

    res.status(201).json({ product });
  } catch (e) {
    next(e);
  }
};

export const restockProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { addQuantity } = req.body;

    const qty = Number(addQuantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "addQuantity must be a number > 0" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.stockQuantity += qty;
    await product.save();

    res.json({ product });
  } catch (e) {
    next(e);
  }
};