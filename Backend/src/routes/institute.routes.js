// routes/institute.routes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  loginInstitute,
  uploadCertificateRecord,
  bulkUploadCertificates,
  uploadAndVerifyCertificate,
  getAllCertificates,
  getVerificationHistory,
} from "../Controllers/institute.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

/* -----------------------------
   Multer setup
----------------------------- */
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage for all file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

/* -----------------------------
   Routes
----------------------------- */

// 🔑 Login
router.post("/login", loginInstitute);

// 📄 Upload single certificate record
router.post(
  "/certificates",
  verifyJWT, // must be institute
  upload.none(), // no file, just JSON
  uploadCertificateRecord
);

// 📦 Bulk upload certificates (CSV/Excel)
router.post(
  "/certificates/bulk",
  verifyJWT,
  upload.single("file"), // field name = file
  bulkUploadCertificates
);

// 📄 Upload & Verify a certificate file
router.post(
  "/verify",
  verifyJWT,
  upload.single("file"), // field name = file
  uploadAndVerifyCertificate
);

// 📊 Get all certificates
router.get("/certificates", verifyJWT, getAllCertificates);

// 📜 Get verification history
router.get("/history", verifyJWT, getVerificationHistory);

export default router;
