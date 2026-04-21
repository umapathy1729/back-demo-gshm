function errorHandler(err, req, res, next) {
  console.error("[order-service error]", err.message);
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID" });
  res.status(err.status || 500).json({ error: err.message || "Server error" });
}
module.exports = { errorHandler };
