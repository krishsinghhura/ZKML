"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = __importDefault(require("express"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const upload_controller_1 = require("../controllers/upload.controller");
exports.uploadRouter = express_1.default.Router();
exports.uploadRouter.post("/upload-model", upload_middleware_1.upload.fields([
    { name: "model_file", maxCount: 1 },
    { name: "requirement_file", maxCount: 1 },
    { name: "app_file", maxCount: 1 } // optional
]), upload_controller_1.handleUpload);
