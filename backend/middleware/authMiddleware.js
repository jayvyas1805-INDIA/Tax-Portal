import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // console.log("Authorization:", req.headers.authorization);

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No Bearer token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("Decoded:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.log("VERIFY ERROR:", err.message);

    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};