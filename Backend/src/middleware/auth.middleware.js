import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import Institute from "../models/institute.model.js";

/* -----------------------------
  Generic JWT Verification Middleware
----------------------------- */
export const verifyJWT = (secret, role) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies.token;
    if (!authHeader) throw new ApiError(401, "No token provided");

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, secret);
    if (!decoded || (role && decoded.role !== role)) {
      throw new ApiError(403, `Unauthorized: ${role || "Access"} only`);
    }

    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
};

/* -----------------------------
  Admin Auth Middleware
----------------------------- */
export const adminAuthMiddleware = (req, res, next) => {
  verifyJWT(process.env.ADMIN_JWT_SECRET, "admin")(req, res, next);
};

/* -----------------------------
  Institute Auth Middleware
----------------------------- */
export const instituteAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies.token;
    if (!authHeader) throw new ApiError(401, "No token provided");

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.INSTITUTE_JWT_SECRET);
    if (!decoded || decoded.role !== "institute") {
      throw new ApiError(403, "Unauthorized: Institute access only");
    }

    const institute = await Institute.findById(decoded.id).select("-password");
    if (!institute) throw new ApiError(404, "Institute not found");

    req.institute = institute;
    next();
  } catch (err) {
    next(err);
  }
};
