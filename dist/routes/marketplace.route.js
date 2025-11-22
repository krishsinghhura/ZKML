"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketplace_controller_1 = require("../controllers/marketplace.controller");
const marketplacerouter = (0, express_1.Router)();
marketplacerouter.get("/models", marketplace_controller_1.getAllModels);
exports.default = marketplacerouter;
