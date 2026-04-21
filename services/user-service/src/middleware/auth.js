const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_production";

function requireAuth(req, res, next) {
  // Accept forwarded header from gateway or direct Authorization
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];

  if (userId) {
    req.userId = userId;
    req.userRole = userRole;
    return next();
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRole !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
}

module.exports = { requireAuth, requireAdmin };
