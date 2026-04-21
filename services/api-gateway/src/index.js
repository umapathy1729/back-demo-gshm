require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createProxyMiddleware } = require("http-proxy-middleware");

const { verifyToken } = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & Logging ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("combined"));
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || "*" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Routes ─────────────────────────────────────────────────────────────────────

// Public routes (no auth)
app.use(
  "/api/users/login",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "/api/users" },
    on: { error: proxyErrorHandler },
  })
);

app.use(
  "/api/users/register",
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    changeOrigin: true,
    on: { error: proxyErrorHandler },
  })
);

// Protected routes (JWT required)
app.use(
  "/api/users",
  verifyToken,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    changeOrigin: true,
    on: { error: proxyErrorHandler },
  })
);

app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL || "http://product-service:3002",
    changeOrigin: true,
    on: { error: proxyErrorHandler },
  })
);

app.use(
  "/api/orders",
  verifyToken,
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || "http://order-service:3003",
    changeOrigin: true,
    on: { error: proxyErrorHandler },
  })
);

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[api-gateway] Listening on port ${PORT}`);
});

function proxyErrorHandler(err, req, res) {
  console.error("[proxy error]", err.message);
  res.status(502).json({ error: "Service temporarily unavailable" });
}

module.exports = app;
