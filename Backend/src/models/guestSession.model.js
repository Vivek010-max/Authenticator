import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const guestSessionSchema = new mongoose.Schema(
  {
    guestSessionId: {
      type: String,
      default: () => uuidv4(), // ✅ auto-generate if not passed
      unique: true,
      index: true,
    },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    certificates: [
      {
        certificateNumber: { type: String, trim: true },
        ocrData: { type: Object },
        status: {
          type: String,
          enum: ["Approved", "Fraud", "Doubtful"],
          default: "Doubtful",
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    ended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Named export
export const GuestSession = mongoose.model("GuestSession", guestSessionSchema);
