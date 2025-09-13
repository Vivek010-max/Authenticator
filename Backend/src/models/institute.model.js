import mongoose from "mongoose";
import bcrypt from "bcrypt";

// =============================
// Institute Schema
// =============================
const InstituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ✅ creates a unique index automatically
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password by default
    },
    status: {
      type: String,
      enum: ["active", "suspended", "revoked"],
      default: "active",
    },
    createdBy: {
      type: String, // admin username who created it
      default: "admin",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    collection: "institutes",
  }
);

// =============================
// Indexes
// =============================
// Only index on status; email is already indexed via unique: true
InstituteSchema.index({ status: 1 });

// =============================
// Middleware: Hash password before save
// =============================
InstituteSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if changed

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// =============================
// Instance Method: Compare password
// =============================
InstituteSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// =============================
// Instance Method: Safe JSON (hide sensitive fields)
// =============================
InstituteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// =============================
// Model Export (Named Export for ESM consistency)
// =============================
export const Institute = mongoose.model("Institute", InstituteSchema);
export default Institute;