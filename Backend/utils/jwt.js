import jwt from "jsonwebtoken";

export const generateToken = ({ id, email, role, dairyId }) => {
  return jwt.sign(
    { id, email, role, dairyId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
