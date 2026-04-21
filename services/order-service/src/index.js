require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const orderRoutes = require("./routes/orders");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "order-service" })
);

app.use("/api/orders", orderRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/orders")
  .then(() => {
    console.log("[order-service] MongoDB connected");
    app.listen(PORT, () =>
      console.log(`[order-service] Listening on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[order-service] DB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
