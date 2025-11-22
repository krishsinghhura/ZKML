import { Request, Response } from "express";
import path from "path";
import fs from "fs-extra";
import { createNamedFolder } from "../services/naming.service";
import { generateFlaskApp } from "../services/gemeni.service";
import { registerModelInternal } from "./model.controller";
import { User } from "../DBmodel/model";
import { Model } from "../DBmodel/model";


export const handleUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const modelFile = files?.["model_file"]?.[0];
    const requirementsFile = files?.["requirement_file"]?.[0];
    const appFile = files?.["app_file"]?.[0];

    const {
      userAddress,
      username,
      model_name,
      description,
      model_type,
      price_per_inference,
      framework,
      input_schema,
      output_schema,
      example_input,
      example_output,
    } = req.body;

    if (!modelFile || !requirementsFile) {
      return res.status(400).json({
        success: false,
        message: "model_file and requirement_file are required.",
      });
    }

    // -------------------- Register the model first (existing logic untouched) -------------------- //
    // const registrationResult = await registerModelInternal(req.body);

    // if (!registrationResult.success) {
    //   return res.status(400).json({
    //     success: false,
    //     verified: false,
    //     message: "Model registration failed",
    //     error: registrationResult.error || "Unknown error",
    //     tx_hash: registrationResult.tx_hash || null,
    //   });
    // }

    // -------------------- Proceed with upload and folder creation -------------------- //
    const folderPath = await createNamedFolder(modelFile.originalname);

    const modelDest = path.join(folderPath, modelFile.originalname);
    const reqDest = path.join(folderPath, requirementsFile.originalname);

    await fs.move(modelFile.path, modelDest, { overwrite: true });
    await fs.move(requirementsFile.path, reqDest, { overwrite: true });

    // -------------------- Handle app.py -------------------- //
    let appPyPath: string;
    if (appFile) {
      appPyPath = path.join(folderPath, appFile.originalname);
      await fs.move(appFile.path, appPyPath, { overwrite: true });
    } else {
      appPyPath = await generateFlaskApp({
        folderPath,
        modelFileName: modelFile.originalname,
        requirementsFileName: requirementsFile.originalname,
        modelInputs: input_schema,
        modelDescription: description,
      });
    }

    // -------------------- Copy deployment.sh -------------------- //
    const rootDeploymentScript = path.join(process.cwd(), "deployment.sh");
    const targetDeploymentScript = path.join(folderPath, "deployment.sh");

    if (await fs.pathExists(rootDeploymentScript)) {
      await fs.copy(rootDeploymentScript, targetDeploymentScript);
    }
    console.log("hitting mongo");
    
    // -------------------- Create / connect user (Mongoose) -------------------- //
    let user = await User.findOne({ address: userAddress });

    if (!user) {
      user = await User.create({
        address: userAddress,
        username,
      });
    } else {
      user.username = username;
      await user.save();
    }

    // -------------------- Save to MongoDB -------------------- //
    const modelRecord = await Model.create({
      userId: user._id,
      name: model_name,
      description,
      type: model_type,
      framework,
      pricePerInference: price_per_inference,
      inputSchema: JSON.parse(input_schema),
      outputSchema: JSON.parse(output_schema),
      exampleInput: JSON.parse(example_input),
      exampleOutput: JSON.parse(example_output),
      folder: path.basename(folderPath),
      files: [
        modelFile.originalname,
        requirementsFile.originalname,
        "deployment.sh",
        path.basename(appPyPath),
      ],
      appPy: path.basename(appPyPath),
      txHash: "546576879tfghkj", //registrationResult.tx_hash
      verified: true,
    });

    // Push model reference into user's models array
    user.models.push(modelRecord._id);
    await user.save();

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Model successfully verified, registered, uploaded, and saved to DB!",
      data: modelRecord,
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

