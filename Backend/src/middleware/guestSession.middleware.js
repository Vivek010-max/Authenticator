// middleware/guestSession.middleware.js
import { v4 as uuidv4 } from "uuid";
import { GuestSession } from "../models/guestSession.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to attach a guestSessionId to the request.
 *  - Checks if guestSessionId exists in cookies or headers
 *  - If not, generates a new UUID and creates a GuestSession in DB
 *  - Sets guestSessionId in req.guestSessionId for controllers
 */
export const guestSessionMiddleware = asyncHandler(async (req, res, next) => {
  let guestSessionId = req.cookies?.guestSessionId || req.headers["x-guest-session-id"];

  if (guestSessionId) {
    // Check if session exists in DB
    const existingSession = await GuestSession.findOne({ guestSessionId, ended: false });
    if (existingSession) {
      req.guestSessionId = guestSessionId;
      return next();
    }
  }

  // Create new guest session
  guestSessionId = uuidv4();
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "unknown";

  await GuestSession.create({
    guestSessionId,
    ipAddress,
    userAgent,
    certificates: [],
  });

  // Attach to request
  req.guestSessionId = guestSessionId;

  // Set cookie for future requests (expires in 24h)
  res.cookie("guestSessionId", guestSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
  });

  next();
});
