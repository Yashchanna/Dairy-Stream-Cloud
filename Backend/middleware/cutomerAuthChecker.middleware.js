import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ SECURITY ADDITION: Check if it's actually a customer token
    if (decoded.role !== "CUSTOMER") {
        return res.status(403).json({ message: "Access denied. Customers only." });
    }

    req.customer = {
      id: decoded.id,
      email: decoded.email,
      dairyId: decoded.dairyId ?? null,
      role: decoded.role // Good to keep track of role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};