import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

dotenv.config();
console.log("RUNNING FILE:", import.meta.url);
console.log("CWD:", process.cwd());
console.log("ENV PORT:", process.env.PORT);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI in .env");
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("server.address():", server.address());
});
server.on("error", (err) => {
  console.error("LISTEN ERROR:", err);
});

start().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});