import jwt from "jsonwebtoken";

// Protect routes for logged-in users
export const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not Authorized", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user info available in req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

// Protect routes for admin only
export const adminOnly = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Admin access only", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email === process.env.ADMIN_EMAIL) {
      req.admin = decoded;
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Admin access only", success: false });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
 