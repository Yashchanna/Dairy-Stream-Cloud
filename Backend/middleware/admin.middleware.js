import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No authorization header provided");
      return res.status(401).json({ message: "Missing authorization header" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Invalid authorization header format");
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("❌ No token extracted from authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ JWT_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== "admin" && decoded.role !== "ADMIN") {
      console.log(`❌ User role is ${decoded.role}, admin access required`);
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = decoded;
    console.log(`✅ Admin verified: ${decoded.email}`);
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

