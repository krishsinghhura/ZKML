"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllModels = void 0;
const model_1 = require("../DBmodel/model"); // contains User schema
const model_2 = require("../DBmodel/model"); // contains Model schema
const getAllModels = async (req, res) => {
    try {
        const models = await model_2.Model.find()
            .sort({ createdAt: -1 })
            .populate({
            path: "userId",
            select: "_id username address",
            model: model_1.User,
        });
        return res.status(200).json({
            success: true,
            count: models.length,
            data: models,
        });
    }
    catch (error) {
        console.error("Error fetching models:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getAllModels = getAllModels;
