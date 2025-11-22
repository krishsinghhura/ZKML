import express from "express";
import { upload } from "../middlewares/upload.middleware";
import { handleUpload } from "../controllers/upload.controller";

export const uploadRouter = express.Router();

uploadRouter.post(
  "/upload-model",
  upload.fields([
    { name: "model_file", maxCount: 1 },
    { name: "requirement_file", maxCount: 1 },
    { name: "app_file", maxCount: 1 } // optional
  ]),
  handleUpload
);
