import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { uploadRouter } from "./routes/upload.route";
import { deployRouter } from "./routes/deploy.route";
import marketplacerouter from "./routes/marketplace.route";
import { connectDB } from "./db/db";

const app = express();

const startServer = async () => {
  try {
    await connectDB();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Static folder to serve uploaded files
    app.use("/upload", express.static(path.join(__dirname, "..", "upload")));

    app.use("/api", uploadRouter);
    app.use("/api", deployRouter);
    app.use("/api", marketplacerouter);

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer(); // <-- Run server AFTER DB connects
