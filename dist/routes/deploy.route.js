"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployRouter = void 0;
const express_1 = __importDefault(require("express"));
const deploy_controller_1 = require("../controllers/deploy.controller");
exports.deployRouter = express_1.default.Router();
// POST /deploy
// Body: { folderName: string }
exports.deployRouter.post("/deploy", deploy_controller_1.deployFolder);
