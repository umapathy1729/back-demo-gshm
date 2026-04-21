const express = require("express");
const axios = require("axios");
const Joi = require("joi");
const Order = require("../models/Order");

const router = express.Router();
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || "http://product-service:3002";

const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});

// GET /api/orders  (user's own orders)
router.get("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    const { page = 1, limit = 10 } = req.query;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments({ userId });
    res.json({ orders, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    const order = await Order.findOne({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// POST /api/orders
router.post("/", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { error, value } = orderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Fetch product details & calculate total
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of value.items) {
      const { data: product } = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
      );
      if (product.stock < item.quantity)
        return res.status(400).json({
          error: `Insufficient stock for product: ${product.name}`,
        });

      enrichedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      userId,
      items: enrichedItems,
      totalAmount,
      shippingAddress: value.shippingAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    if (err.response?.status === 404)
      return res.status(404).json({ error: "Product not found" });
    next(err);
  }
});

// PATCH /api/orders/:id/status  (admin)
router.patch("/:id/status", async (req, res, next) => {
  try {
    const role = req.headers["x-user-role"];
    if (role !== "admin") return res.status(403).json({ error: "Admin only" });

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id  (cancel)
router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    const order = await Order.findOne({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "pending")
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
