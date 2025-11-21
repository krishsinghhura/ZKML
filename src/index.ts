import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { uploadRouter } from "./routes/upload.route";
import {deployRouter} from "./routes/deploy.route"
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder to serve uploaded files
app.use("/upload", express.static(path.join(__dirname, "..", "upload")));

app.use("/api", uploadRouter);

app.use("/api",deployRouter)

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
