import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const MONGO_URI = `${process.env.MONGO_URI}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT} and in ${process.env.NODE_ENV} mode with DB: ${DB_NAME}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
