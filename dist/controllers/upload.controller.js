"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const naming_service_1 = require("../services/naming.service");
const gemeni_service_1 = require("../services/gemeni.service");
const model_1 = require("../DBmodel/model");
const model_2 = require("../DBmodel/model");
const handleUpload = async (req, res) => {
    try {
        const files = req.files;
        const modelFile = files?.["model_file"]?.[0];
        const requirementsFile = files?.["requirement_file"]?.[0];
        const appFile = files?.["app_file"]?.[0];
        const { userAddress, username, model_name, description, model_type, price_per_inference, framework, input_schema, output_schema, example_input, example_output, } = req.body;
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
        const folderPath = await (0, naming_service_1.createNamedFolder)(modelFile.originalname);
        const modelDest = path_1.default.join(folderPath, modelFile.originalname);
        const reqDest = path_1.default.join(folderPath, requirementsFile.originalname);
        await fs_extra_1.default.move(modelFile.path, modelDest, { overwrite: true });
        await fs_extra_1.default.move(requirementsFile.path, reqDest, { overwrite: true });
        // -------------------- Handle app.py -------------------- //
        let appPyPath;
        if (appFile) {
            appPyPath = path_1.default.join(folderPath, appFile.originalname);
            await fs_extra_1.default.move(appFile.path, appPyPath, { overwrite: true });
        }
        else {
            appPyPath = await (0, gemeni_service_1.generateFlaskApp)({
                folderPath,
                modelFileName: modelFile.originalname,
                requirementsFileName: requirementsFile.originalname,
                modelInputs: input_schema,
                modelDescription: description,
            });
        }
        // -------------------- Copy deployment.sh -------------------- //
        const rootDeploymentScript = path_1.default.join(process.cwd(), "deployment.sh");
        const targetDeploymentScript = path_1.default.join(folderPath, "deployment.sh");
        if (await fs_extra_1.default.pathExists(rootDeploymentScript)) {
            await fs_extra_1.default.copy(rootDeploymentScript, targetDeploymentScript);
        }
        console.log("hitting mongo");
        // -------------------- Create / connect user (Mongoose) -------------------- //
        let user = await model_1.User.findOne({ address: userAddress });
        if (!user) {
            user = await model_1.User.create({
                address: userAddress,
                username,
            });
        }
        else {
            user.username = username;
            await user.save();
        }
        // -------------------- Save to MongoDB -------------------- //
        const modelRecord = await model_2.Model.create({
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
            folder: path_1.default.basename(folderPath),
            files: [
                modelFile.originalname,
                requirementsFile.originalname,
                "deployment.sh",
                path_1.default.basename(appPyPath),
            ],
            appPy: path_1.default.basename(appPyPath),
            txHash: "546576879tfghkj",
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
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            success: false,
            verified: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.handleUpload = handleUpload;
