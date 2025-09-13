// controllers/verify.controller.js
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import { GuestSession } from "../models/guestSession.model.js";
import VerificationAttempt from "../models/verificationAttempt.model.js";
import CertificateRecord from "../models/certificateRecord.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* -----------------------------
   1️⃣ Start Guest Session
----------------------------- */
export const startGuestSession = asyncHandler(async (req, res) => {
  const guestSessionId = uuidv4();
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "unknown";

  await GuestSession.create({
    guestSessionId,
    ipAddress,
    userAgent,
    certificates: [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { guestSessionId }, "Guest session started"));
});

/* -----------------------------
   2️⃣ Upload & Verify Certificates
----------------------------- */
export const verifyCertificates = asyncHandler(async (req, res) => {
  const { guestSessionId } = req.body;

  if (!guestSessionId) {
    throw new ApiError(400, "guestSessionId is required");
  }

  const session = await GuestSession.findOne({ guestSessionId });
  if (!session || session.ended) {
    throw new ApiError(404, "Guest session not found or already ended");
  }

  const files = req.files || [];
  if (!files.length) throw new ApiError(400, "No files uploaded");
  if (files.length > 10) throw new ApiError(400, "Maximum 10 files allowed");

  const results = [];

  for (const file of files) {
    let ocrData = {};

    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const ocrResponse = await axios.post(
        process.env.OCR_API_URL || "https://ocr-api-repo.onrender.com/api/extract/",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          timeout: 60000,
        }
      );

      ocrData = ocrResponse.data || {};
    } catch (err) {
      console.error("OCR API Error:", err.response?.data || err.message);
      ocrData = { error: "OCR failed" };
    }

    // Normalize OCR fields
    const normalized = {
      certificateNumber: ocrData["Enrollment No"]?.trim(),
      studentName: ocrData["Student Name"]?.trim(),
      course: ocrData["Course"]?.trim(),
      branch: ocrData["Branch"]?.trim(),
      semester: ocrData["Semester"]?.trim(),
      statementNo: ocrData["Statement No"]?.trim(),
      university: ocrData["University"]?.trim(),
      subjects: ocrData["Subjects"] || [],
      issueDate: ocrData["Date"] ? new Date(ocrData["Date"]) : null,
    };

    // Try to match with CertificateRecord
    let certificateRecord = null;
    if (normalized.certificateNumber) {
      certificateRecord = await CertificateRecord.findOne({
        certificateNumber: normalized.certificateNumber,
      });
    }

    // Set status using exact enum values
    let status = "Doubtful"; // default
    if (!certificateRecord) status = "Fraud";
    else if (
      certificateRecord.studentName === normalized.studentName &&
      certificateRecord.course === normalized.course &&
      certificateRecord.additionalData?.get("Branch") === normalized.branch &&
      (!normalized.issueDate ||
        new Date(certificateRecord.issueDate).getTime() ===
          normalized.issueDate.getTime())
    ) {
      status = "Approved";
    }

    // Save VerificationAttempt
    const attempt = await VerificationAttempt.create({
      guestSessionId,
      certificateRecord: certificateRecord?._id || null,
      certificateNumber: normalized.certificateNumber,
      status, // matches enum exactly
      ocrData,
      uploadedFile: file.path,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Append summary to session
    session.certificates.push({
      certificateNumber: normalized.certificateNumber,
      ocrData,
      status, // matches enum exactly
      uploadedAt: new Date(),
    });

    results.push({
      certificateNumber: normalized.certificateNumber,
      status,
      ocrData,
    });
  }

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, results, "Certificates verified successfully"));
});

/* -----------------------------
   3️⃣ Get Session History
----------------------------- */
export const getSessionHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await GuestSession.findOne({ guestSessionId: sessionId });
  if (!session) throw new ApiError(404, "Guest session not found");

  return res
    .status(200)
    .json(new ApiResponse(200, session.certificates, "Session history fetched"));
});

/* -----------------------------
   4️⃣ End Guest Session
----------------------------- */
export const endGuestSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await GuestSession.findOne({ guestSessionId: sessionId });
  if (!session) throw new ApiError(404, "Guest session not found");

  session.ended = true;
  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Guest session ended successfully"));
});

/* -----------------------------
   5️⃣ Manual Verify
----------------------------- */
export const manualVerify = asyncHandler(async (req, res) => {
  const { certificateNumber } = req.body;

  if (!certificateNumber) throw new ApiError(400, "certificateNumber is required");

  const record = await CertificateRecord.findOne({ certificateNumber });

  if (!record)
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Certificate not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, record, "Certificate verified"));
});
