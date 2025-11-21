import express from "express";
import { deployFolder } from "../controllers/deploy.controller";

export const deployRouter = express.Router();

// POST /deploy
// Body: { folderName: string }
deployRouter.post("/deploy", deployFolder);
