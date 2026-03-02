import jwt from "jsonwebtoken";

export const verifyAgent = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (String(decoded?.role || "").toUpperCase() !== "AGENT") {
      return res.status(403).json({ message: "Access denied. Agents only." });
    }

    req.agent = {
      id: decoded.id,
      agentId: decoded.agentId,
      dairyId: decoded.dairyId ?? null,
      role: decoded.role,
    };

    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

