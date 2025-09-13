import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import verifierRoutes from "./routes/verifier.routes.js";
import instituteRoutes from "./routes/institute.routes.js";
import adminRoutes from "./routes/admin.routes.js";


// Import routes

dotenv.config();

const app = express();

// Security middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.trim() || process.env.FRONTEND_URL?.trim() || "http://localhost:5173",
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
app.use(morgan("dev"));

-

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Certificate Verification Platform API!",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/verify", verifierRoutes);
app.use("/institute", instituteRoutes);
app.use("/admin", adminRoutes);




// Initialize services


// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  fileCleanupService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  fileCleanupService.stop();
  process.exit(0);
});

export default app;
