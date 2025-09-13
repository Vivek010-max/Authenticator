// controllers/institute.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import csv from "csv-parser";
import fs from "fs";
import xlsx from "xlsx";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Institute from "../models/institute.model.js";
import CertificateRecord from "../models/certificateRecord.model.js";
import VerificationAttempt from "../models/verificationAttempt.model.js";

/* -----------------------------
   🔑 Institute Login
----------------------------- */
export const loginInstitute = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const institute = await Institute.findOne({ email });
  if (!institute) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, institute.passwordHash);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: institute._id, role: "institute" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Login successful"));
});

/* -----------------------------
   📄 Upload single certificate record
----------------------------- */
export const uploadCertificateRecord = asyncHandler(async (req, res) => {
  const {
    university,
    enrollmentNo,
    studentName,
    course,
    branch,
    subjects,
    date,
    statementNo,
    semester,
  } = req.body;

  const instituteId = req.user.id; // from auth middleware

  if (!studentName || !enrollmentNo || !course) {
    throw new ApiError(400, "Student Name, Enrollment No, and Course are required");
  }

  const record = await CertificateRecord.create({
    institute: instituteId,
    university,
    enrollmentNo,
    studentName,
    course,
    branch,
    subjects,
    date,
    statementNo,
    semester,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, record, "Certificate record added"));
});

/* -----------------------------
   📦 Bulk upload (CSV/Excel)
----------------------------- */
export const bulkUploadCertificates = asyncHandler(async (req, res) => {
  const instituteId = req.user.id;
  if (!req.file) throw new ApiError(400, "File is required");

  const filePath = req.file.path;
  const records = [];

  if (req.file.mimetype.includes("csv")) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          records.push({ ...row, institute: instituteId });
        })
        .on("end", resolve)
        .on("error", reject);
    });
  } else if (
    req.file.mimetype.includes("excel") ||
    req.file.mimetype.includes("spreadsheetml")
  ) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    sheet.forEach((row) => {
      records.push({ ...row, institute: instituteId });
    });
  } else {
    throw new ApiError(400, "Unsupported file format");
  }

  const inserted = await CertificateRecord.insertMany(records);
  return res
    .status(201)
    .json(new ApiResponse(201, inserted, "Bulk upload completed"));
});

/* -----------------------------
   📄 Upload + Verify certificate
----------------------------- */
export const uploadAndVerifyCertificate = asyncHandler(async (req, res) => {
  const instituteId = req.user.id;
  if (!req.file) throw new ApiError(400, "Certificate file is required");

  // Call OCR service
  const ocrResponse = await axios.post(
    `${process.env.OCR_SERVICE_URL}/ocr`,
    { filePath: req.file.path },
    { headers: { "Content-Type": "application/json" } }
  );

  const ocrData = ocrResponse.data;

  const certificate = await CertificateRecord.findOne({
    institute: instituteId,
    enrollmentNo: ocrData["Enrollment No"],
  });

  let status = "doubtful";
  if (certificate) {
    status =
      certificate.studentName === ocrData["Student Name"] &&
      certificate.course === ocrData["Course"]
        ? "approved"
        : "fraud";
  } else {
    status = "fraud";
  }

  const attempt = await VerificationAttempt.create({
    institute: instituteId,
    certificate: certificate ? certificate._id : null,
    certificateNumber: ocrData["Enrollment No"], // treat Enrollment No as unique ID
    ocrData,
    status,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { status, attempt }, "Verification completed"));
});

/* -----------------------------
   📊 Get all certificates
----------------------------- */
export const getAllCertificates = asyncHandler(async (req, res) => {
  const instituteId = req.user.id;
  const records = await CertificateRecord.find({ institute: instituteId });
  return res
    .status(200)
    .json(new ApiResponse(200, records, "Certificates fetched"));
});

/* -----------------------------
   📜 Get verification history
----------------------------- */
export const getVerificationHistory = asyncHandler(async (req, res) => {
  const instituteId = req.user.id;
  const history = await VerificationAttempt.find({ institute: instituteId })
    .sort({ createdAt: -1 })
    .lean();
  return res
    .status(200)
    .json(new ApiResponse(200, history, "Verification history fetched"));
});
