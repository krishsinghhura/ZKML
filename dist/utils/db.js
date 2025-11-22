"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDB = readDB;
exports.writeDB = writeDB;
exports.addModelRecord = addModelRecord;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(process.cwd(), "db.json");
/**
 * Read database (returns empty object if not exists)
 */
async function readDB() {
    try {
        const exists = await fs_extra_1.default.pathExists(DB_PATH);
        if (!exists)
            return {};
        const data = await fs_extra_1.default.readFile(DB_PATH, "utf-8");
        return JSON.parse(data);
    }
    catch (err) {
        console.error("Error reading DB:", err);
        return {};
    }
}
/**
 * Write database
 */
async function writeDB(db) {
    try {
        await fs_extra_1.default.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
    catch (err) {
        console.error("Error writing DB:", err);
    }
}
/**
 * Add a new model record for a user
 */
async function addModelRecord(username, record) {
    const db = await readDB();
    if (!db[username])
        db[username] = [];
    db[username].push(record);
    await writeDB(db);
}
