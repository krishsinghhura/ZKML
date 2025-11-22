"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
// User Schema
const userSchema = new Schema({
    id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
    },
    address: {
        type: String,
        unique: true,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    models: [
        {
            type: Schema.Types.ObjectId,
            ref: "Model",
        },
    ],
}, { timestamps: true });
// Model Schema
const modelSchema = new Schema({
    id: {
        type: String,
        default: () => new mongoose_1.default.Types.ObjectId().toString(),
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    framework: { type: String, required: true },
    pricePerInference: { type: mongoose_1.default.Types.Decimal128, required: true },
    inputSchema: { type: Schema.Types.Mixed, required: true },
    outputSchema: { type: Schema.Types.Mixed, required: true },
    exampleInput: { type: Schema.Types.Mixed, required: true },
    exampleOutput: { type: Schema.Types.Mixed, required: true },
    folder: { type: String, required: true },
    files: { type: Schema.Types.Mixed, required: true },
    appPy: { type: String, required: true },
    txHash: { type: String, required: true },
    verified: { type: Boolean, default: false },
    deployed: { type: Boolean, default: false },
    port: { type: Number, default: null },
    routes: { type: [String], default: [] },
    ipfsCid: { type: String },
    ec2Path: { type: String },
    // NEW FIELD HERE
    endpointUrl: { type: String, default: null },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
// Composite constraint equivalent of @@unique([userId, name])
modelSchema.index({ userId: 1, name: 1 }, { unique: true });
exports.User = mongoose_1.default.model("User", userSchema);
exports.Model = mongoose_1.default.model("Model", modelSchema);
