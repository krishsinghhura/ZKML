import { Request, Response } from "express";
import path from "path";
import fs from "fs-extra";
import { createNamedFolder } from "../services/naming.service";
import { generateFlaskApp } from "../services/gemeni.service";
import { registerModelInternal } from "./model.controller"; // import internal function

export const handleUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const modelFile = files?.["model_file"]?.[0];
    const requirementsFile = files?.["requirement_file"]?.[0];

    const {
      userAddress,
      model_name,
      description,
      model_type,
      price_per_inference,
      framework,
      input_schema,
      output_schema,
      example_input,
      example_output,
      proof
    } = req.body;

    if (!modelFile || !requirementsFile) {
      return res.status(400).json({
        success: false,
        message: "model_file and requirement_file are required.",
      });
    }

    // -------------------- Register the model first -------------------- //
    const registrationResult = await registerModelInternal(req.body);

    // If registration failed or transaction failed
    if (!registrationResult.success) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Model registration failed",
        error: registrationResult.error || "Unknown error",
        tx_hash: registrationResult.tx_hash || null
      });
    }

    // -------------------- Proceed with upload and folder creation -------------------- //
    const folderPath = await createNamedFolder(modelFile.originalname);

    const modelDest = path.join(folderPath, modelFile.originalname);
    const reqDest = path.join(folderPath, requirementsFile.originalname);

    await fs.move(modelFile.path, modelDest, { overwrite: true });
    await fs.move(requirementsFile.path, reqDest, { overwrite: true });

    const rootDeploymentScript = path.join(process.cwd(), "deployment.sh");
    const targetDeploymentScript = path.join(folderPath, "deployment.sh");

    if (await fs.pathExists(rootDeploymentScript)) {
      await fs.copy(rootDeploymentScript, targetDeploymentScript);
      console.log(`deployment.sh copied into ${folderPath}`);
    } else {
      console.warn("⚠️ WARNING: deployment.sh not found in project root. Skipping copy.");
    }

    // Generate Flask app via Gemini
    const appPyPath = await generateFlaskApp({
      folderPath,
      modelFileName: modelFile.originalname,
      requirementsFileName: requirementsFile.originalname,
      modelInputs: input_schema,
      modelDescription: description,
    });

    // Respond success
    return res.status(200).json({
      success: true,
      verified: true,
      message: "Model successfully verified, registered, and files uploaded!",
      data: {
        folder: path.basename(folderPath),
        files: [modelFile.originalname, requirementsFile.originalname, "deployment.sh"],
        app_py: path.basename(appPyPath),
        userAddress,
        model_name,
        description,
        model_type,
        price_per_inference,
        framework,
        input_schema,
        output_schema,
        example_input,
        example_output,
        tx_hash: registrationResult.tx_hash
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
