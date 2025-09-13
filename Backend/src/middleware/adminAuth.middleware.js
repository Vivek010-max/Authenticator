// middlewares/adminAuth.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, "No token provided, admin auth required");
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (decoded.role !== "admin") {
      throw new ApiError(403, "Access denied, not an admin");
    }

    req.admin = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, "Unauthorized: " + err.message));
  }
};

export default verifyAdmin;