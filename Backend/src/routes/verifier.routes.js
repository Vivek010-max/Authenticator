// routes/verify.routes.js
import express from "express";
import multer from "multer";
import {
  startGuestSession,
  endGuestSession,
  verifyCertificates,
  manualVerify,
  getSessionHistory,
} from "../Controllers/verifier.controller.js";

const router = express.Router();

/* -------------------------
   Multer setup
------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ensure uploads folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/* -------------------------
   Routes
------------------------- */

// Start a guest session
router.post("/session", startGuestSession);

// End a guest session
router.delete("/session/:sessionId", endGuestSession);

// Verify certificates (accept only "file" key now)
router.post(
  "/",
  upload.array("file", 10), // ✅ max 10 files
  verifyCertificates
);

// Manual verify (by certificate number, etc.)
router.post("/manual", manualVerify);

// Fetch session history
router.get("/history/:sessionId", getSessionHistory);

export default router;
