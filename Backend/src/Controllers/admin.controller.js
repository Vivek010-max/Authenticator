import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Institute from "../models/institute.model.js";
import VerificationAttempt from "../models/verificationAttempt.model.js";

/* -----------------------------
  Helper: Generate JWT for Admin
----------------------------- */
const generateAdminToken = (adminUsername) => {
  return jwt.sign(
    { role: "admin", username: adminUsername },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/* -----------------------------
  Admin Login (env-based)
----------------------------- */
export const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = generateAdminToken(username);

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, "Admin login successful"));
});

/* -----------------------------
  Create (Enroll) Institute
----------------------------- */
export const createInstitute = asyncHandler(async (req, res) => {
  const { name, email, password, contactNumber, address } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existing = await Institute.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Institute already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const institute = await Institute.create({
    name,
    email,
    passwordHash: hashedPassword, // ✅ fixed
    contactNumber,
    address,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, institute, "Institute created successfully"));
});

/* -----------------------------
  Get All Institutes
----------------------------- */
export const getAllInstitutes = asyncHandler(async (req, res) => {
  const institutes = await Institute.find().select("-passwordHash"); // ✅ fixed
  return res
    .status(200)
    .json(new ApiResponse(200, institutes, "Institutes fetched successfully"));
});

/* -----------------------------
  Deactivate (Revoke) Institute
----------------------------- */
export const deactivateInstitute = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institute = await Institute.findById(id);
  if (!institute) {
    throw new ApiError(404, "Institute not found");
  }

  institute.status = "revoked";
  await institute.save();

  return res
    .status(200)
    .json(new ApiResponse(200, institute, "Institute deactivated successfully"));
});

/* -----------------------------
  Get Failed/Doubtful Verifications
----------------------------- */
export const getFailedVerifications = asyncHandler(async (req, res) => {
  const attempts = await VerificationAttempt.find({
    status: { $in: ["fraud", "doubtful"] },
  })
    .populate("certificate") // ✅ ensure field name matches model
    .populate("institute", "name email"); // ✅ fixed

  return res.status(200).json(
    new ApiResponse(
      200,
      attempts,
      "Failed/Doubtful verifications fetched successfully"
    )
  );
});

/* -----------------------------
  Analytics Endpoints
----------------------------- */

/* 1️⃣ Summary Stats */
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const totalInstitutes = await Institute.countDocuments();
  const totalVerifications = await VerificationAttempt.countDocuments(); // ✅ renamed
  const totalApproved = await VerificationAttempt.countDocuments({ status: "approved" });
  const totalFraud = await VerificationAttempt.countDocuments({ status: "fraud" });
  const totalDoubtful = await VerificationAttempt.countDocuments({ status: "doubtful" });

  return res.status(200).json(
    new ApiResponse(200, {
      totalInstitutes,
      totalVerifications,
      totalApproved,
      totalFraud,
      totalDoubtful,
    }, "Analytics summary fetched")
  );
});

/* 2️⃣ Verifications per Institute */
export const getInstituteVerifications = asyncHandler(async (req, res) => {
  const aggregation = await VerificationAttempt.aggregate([
    { $match: { institute: { $ne: null } } }, // ✅ fixed
    {
      $group: {
        _id: "$institute",
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        fraud: { $sum: { $cond: [{ $eq: ["$status", "fraud"] }, 1, 0] } },
        doubtful: { $sum: { $cond: [{ $eq: ["$status", "doubtful"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "institutes",
        localField: "_id",
        foreignField: "_id",
        as: "institute",
      },
    },
    { $unwind: "$institute" },
    {
      $project: {
        _id: 0,
        instituteId: "$institute._id",
        instituteName: "$institute.name",
        total: 1,
        approved: 1,
        fraud: 1,
        doubtful: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, aggregation, "Institute verification stats fetched")
  );
});

/* 3️⃣ Latest Failed / Doubtful Verifications */
export const getLatestFailedVerifications = asyncHandler(async (req, res) => {
  const failed = await VerificationAttempt.find({ status: { $in: ["fraud", "doubtful"] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("institute", "name email") // ✅ fixed
    .populate("certificate"); // ✅ fixed

  return res.status(200).json(
    new ApiResponse(200, failed, "Latest failed/doubtful verifications fetched")
  );
});

/* 4️⃣ Daily Verification Trends (last 7 days) */
export const getDailyVerificationTrends = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trends = await VerificationAttempt.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        fraud: { $sum: { $cond: [{ $eq: ["$status", "fraud"] }, 1, 0] } },
        doubtful: { $sum: { $cond: [{ $eq: ["$status", "doubtful"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, trends, "Daily verification trends (last 7 days) fetched")
  );
});
