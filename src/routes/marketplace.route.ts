import { Router } from "express";
import { getAllModels } from "../controllers/marketplace.controller";

const marketplacerouter = Router();

marketplacerouter.get("/models", getAllModels);

export default marketplacerouter;
