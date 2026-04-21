function errorHandler(err, req, res, next) {
  console.error("[user-service error]", err.message);
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate key error" });
  }
  res.status(err.status || 500).json({ error: err.message || "Server error" });
}

module.exports = { errorHandler };
