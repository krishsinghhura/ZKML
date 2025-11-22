"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModelGroth16 = registerModelGroth16;
const ethers_1 = require("ethers");
const modelregistry_1 = require("./modelregistry");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers_1.ethers.Contract(process.env.CONTRACT_ADDRESS, modelregistry_1.abi.abi, wallet);
async function registerModelGroth16(data) {
    const { model_name, version, model_type, pricing_per_inference, example_input_hash, example_output_hash, a, b_flat, c, public_inputs } = data;
    const tx = await contract.registerModelGroth16(model_name, version, model_type, pricing_per_inference, example_input_hash, example_output_hash, a, b_flat, c, public_inputs);
    return tx.wait();
}
