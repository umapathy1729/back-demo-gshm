const express = require("express");
const Joi = require("joi");
const Product = require("../models/Product");

const router = express.Router();

const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(5).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).default(0),
  category: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
});

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);
    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products  (admin)
router.post("/", async (req, res, next) => {
  try {
    const role = req.headers["x-user-role"];
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    const { error, value } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const product = await Product.create({
      ...value,
      createdBy: req.headers["x-user-id"],
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id  (admin)
router.put("/:id", async (req, res, next) => {
  try {
    const role = req.headers["x-user-role"];
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id  (admin, soft delete)
router.delete("/:id", async (req, res, next) => {
  try {
    const role = req.headers["x-user-role"];
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
