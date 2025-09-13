import mongoose from "mongoose";

// =============================
// Certificate Record Schema (Updated to match OCR output)
// =============================
const CertificateRecordSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
    university: {
      type: String,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      required: [true, "Enrollment number is required"],
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    subjects: [
      {
        type: String, // list of subjects
        trim: true,
      },
    ],
    date: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    statementNo: {
      type: String,
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: String, // who uploaded (admin/institute user id/email)
      default: "institute",
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    collection: "certificate_records",
  }
);

// =============================
// Indexes
// =============================
// Ensure uniqueness per institute & enrollmentNo
CertificateRecordSchema.index(
  { instituteId: 1, enrollmentNo: 1, statementNo: 1 },
  { unique: true }
);

// =============================
// Instance Method: Check if valid
// =============================
CertificateRecordSchema.methods.isValidRecord = function () {
  return !this.isRevoked;
};

// =============================
// Model Export
// =============================
const CertificateRecord = mongoose.model(
  "CertificateRecord",
  CertificateRecordSchema
);

export default CertificateRecord;
