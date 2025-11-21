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
const handleUpload = async (req, res) => {
    try {
        const files = req.files;
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
        const folderPath = await (0, naming_service_1.createNamedFolder)(modelFile.originalname);
        // 2️⃣ Move files into folder without renaming
        const modelDest = path_1.default.join(folderPath, modelFile.originalname);
        const reqDest = path_1.default.join(folderPath, requirementsFile.originalname);
        await fs_extra_1.default.move(modelFile.path, modelDest, { overwrite: true });
        await fs_extra_1.default.move(requirementsFile.path, reqDest, { overwrite: true });
        // 3️⃣ Generate Flask app via Gemeni AI (single-call)
        const appPyPath = await (0, gemeni_service_1.generateFlaskApp)({
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
                folder: path_1.default.basename(folderPath),
                files: [modelFile.originalname, requirementsFile.originalname],
                app_py: path_1.default.basename(appPyPath),
                modelInputs,
                modelDescription,
            },
        });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.handleUpload = handleUpload;
