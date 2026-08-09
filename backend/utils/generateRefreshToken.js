import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
  );
};

export default generateRefreshToken;
