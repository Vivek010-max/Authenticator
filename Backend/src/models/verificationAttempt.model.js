import mongoose from "mongoose";

const verificationAttemptSchema = new mongoose.Schema(
  {
    guestSessionId: { type: String, required: true, index: true },
    certificateRecord: { type: mongoose.Schema.Types.ObjectId, ref: "CertificateRecord" },
    certificateNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Approved", "Fraud", "Doubtful"], // ✅ Match GuestSession
      default: "Doubtful",
    },
    ocrData: { type: Object },
    uploadedFile: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("VerificationAttempt", verificationAttemptSchema);
