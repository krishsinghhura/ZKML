"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFolderToIPFS = uploadFolderToIPFS;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const sdk_1 = __importDefault(require("@pinata/sdk"));
const PINATA_API_KEY = process.env.PINATA_API_KEY || "";
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || "";
if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API key and secret must be set in environment variables");
}
const pinata = new sdk_1.default(PINATA_API_KEY, PINATA_SECRET_API_KEY);
//55b5a81ed79cc583de29
//70089001412cb9630a1b8e657c371a116c3cc2cc2a9cab92ebd789ab3bfc461f
/**
 * Uploads a local folder to IPFS via Pinata.
 * @param folderPath Absolute or relative path to the folder
 * @param folderName Name to use for the folder on IPFS
 * @returns CID string of the uploaded folder
 */
async function uploadFolderToIPFS(folderPath, folderName) {
    // Ensure the folder exists
    if (!(await fs_extra_1.default.pathExists(folderPath))) {
        throw new Error(`Folder does not exist: ${folderPath}`);
    }
    // Collect all files recursively
    const collectFiles = async (dir, basePath = "") => {
        const entries = await fs_extra_1.default.readdir(dir);
        const files = [];
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry);
            const stat = await fs_extra_1.default.stat(fullPath);
            if (stat.isDirectory()) {
                files.push(...(await collectFiles(fullPath, path_1.default.join(basePath, entry))));
            }
            else if (stat.isFile()) {
                const content = await fs_extra_1.default.readFile(fullPath);
                files.push({ path: path_1.default.join(basePath, entry), content });
            }
        }
        return files;
    };
    const files = await collectFiles(folderPath);
    // Pin folder to IPFS
    const result = await pinata.pinFromFS(folderPath, {
        pinataMetadata: {
            name: folderName,
        },
        pinataOptions: {
            cidVersion: 1,
        },
    });
    // Returns the IPFS hash (CID)
    return result.IpfsHash;
}
