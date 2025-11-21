"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamedFolder = createNamedFolder;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const UPLOAD_DIR = path_1.default.join(__dirname, "..", "..", "upload");
async function createNamedFolder(modelFileName, username = "krishna") {
    const baseName = path_1.default.parse(modelFileName).name; // remove extension
    let version = 0;
    let folderName = `${username}-${baseName}`;
    // Check existing folders and find next version
    while (await fs_extra_1.default.pathExists(path_1.default.join(UPLOAD_DIR, version ? `${folderName}-v${version}` : folderName))) {
        version++;
    }
    if (version > 0) {
        folderName = `${folderName}-v${version}`;
    }
    const folderPath = path_1.default.join(UPLOAD_DIR, folderName);
    await fs_extra_1.default.ensureDir(folderPath);
    return folderPath;
}
