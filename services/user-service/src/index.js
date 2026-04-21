require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health
app.get("/health", (_, res) =>
  res.json({ status: "ok", service: "user-service" })
);

// Routes
app.use("/api/users", authRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

// DB + Start
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/users")
  .then(() => {
    console.log("[user-service] MongoDB connected");
    app.listen(PORT, () =>
      console.log(`[user-service] Listening on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("[user-service] DB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
