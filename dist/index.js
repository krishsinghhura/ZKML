"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const upload_route_1 = require("./routes/upload.route");
const deploy_route_1 = require("./routes/deploy.route");
const marketplace_route_1 = __importDefault(require("./routes/marketplace.route"));
const db_1 = require("./db/db");
const app = (0, express_1.default)();
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        // Static folder to serve uploaded files
        app.use("/upload", express_1.default.static(path_1.default.join(__dirname, "..", "upload")));
        app.use("/api", upload_route_1.uploadRouter);
        app.use("/api", deploy_route_1.deployRouter);
        app.use("/api", marketplace_route_1.default);
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer(); // <-- Run server AFTER DB connects
