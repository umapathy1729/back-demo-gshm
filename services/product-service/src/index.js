require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const productRoutes = require("./routes/products");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "product-service" })
);

app.use("/api/products", productRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/products")
  .then(() => {
    console.log("[product-service] MongoDB connected");
    app.listen(PORT, () =>
      console.log(`[product-service] Listening on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[product-service] DB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
