import { ethers } from "ethers";
import {abi} from "./modelregistry";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    abi.abi,
    wallet
);

export async function registerModelGroth16(data: any) {
    const {
        model_name,
        version,
        model_type,
        pricing_per_inference,
        example_input_hash,
        example_output_hash,
        a,
        b_flat,
        c,
        public_inputs
    } = data;

    const tx = await contract.registerModelGroth16(
        model_name,
        version,
        model_type,
        pricing_per_inference,
        example_input_hash,
        example_output_hash,
        a,
        b_flat,
        c,
        public_inputs
    );

    return tx.wait();
}
