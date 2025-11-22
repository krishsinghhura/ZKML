import { Request, Response } from "express";
import { User } from "../DBmodel/model";   // contains User schema
import { Model } from "../DBmodel/model";  // contains Model schema

export const getAllModels = async (req: Request, res: Response) => {
  try {
    const models = await Model.find()
      .sort({ createdAt: -1 }) 
      .populate({
        path: "userId",
        select: "_id username address", 
        model: User,
      });

    return res.status(200).json({
      success: true,
      count: models.length,
      data: models,
    });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
