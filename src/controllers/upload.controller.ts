import { Request, Response } from "express";
import path from "path";
import fs from "fs-extra";
import { createNamedFolder } from "../services/naming.service";
import { generateFlaskApp } from "../services/gemeni.service";

export const handleUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const modelFile = files?.["model_file"]?.[0];
    const requirementsFile = files?.["requirements"]?.[0];

    const { modelInputs, modelDescription } = req.body;

    if (!modelFile || !requirementsFile) {
      return res.status(400).json({
        success: false,
        message: "model_file and requirements file are required.",
      });
    }

    // 1️⃣ Create versioned folder
    const folderPath = await createNamedFolder(modelFile.originalname);

    // 2️⃣ Move files into folder without renaming
    const modelDest = path.join(folderPath, modelFile.originalname);
    const reqDest = path.join(folderPath, requirementsFile.originalname);

    await fs.move(modelFile.path, modelDest, { overwrite: true });
    await fs.move(requirementsFile.path, reqDest, { overwrite: true });

    // 3️⃣ Generate Flask app via Gemeni AI (single-call)
    const appPyPath = await generateFlaskApp({
      folderPath,
      modelFileName: modelFile.originalname,
      requirementsFileName: requirementsFile.originalname,
      modelInputs,
      modelDescription,
    });

    return res.status(200).json({
      success: true,
      message: "Files uploaded and Flask app generated successfully!",
      data: {
        folder: path.basename(folderPath),
        files: [modelFile.originalname, requirementsFile.originalname],
        app_py: path.basename(appPyPath),
        modelInputs,
        modelDescription,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
