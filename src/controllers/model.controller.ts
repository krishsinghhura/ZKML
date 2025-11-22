import { Request, Response } from "express";
import crypto from "crypto";
import { registerModelGroth16 } from "../services/contract.service";

// -------------------- HELPERS -------------------- //

function sha256(data: any): string {
    return crypto.createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
}

function toBytes32(x: string): string {
    if (!x) return "0x" + "0".repeat(64);
    if (x.startsWith("0x")) {
        const raw = x.slice(2);
        return "0x" + raw.padStart(64, "0");
    }
    if (/^\d+$/.test(x)) {
        return "0x" + BigInt(x).toString(16).padStart(64, "0");
    }
    return "0x" + x.padStart(64, "0");
}

function flattenProofB(b: any[][]): string[] {
    const flat: string[] = [];
    for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[i].length; j++) {
            flat.push(toBytes32(b[i][j]));
        }
    }
    return flat;
}

function normalizeProof(proof: any) {
    return {
        a: proof.pi_a.map(toBytes32),
        b_flat: flattenProofB(proof.pi_b),
        c: proof.pi_c.map(toBytes32),
        public_inputs: proof.publicSignals.map((x: string) => BigInt(x))
    };
}

// ----------------- MAIN CONTROLLER ---------------- //

/**
 * Original Express handler
 */
export async function registerModel(req: Request, res: Response) {
    try {
        const result = await registerModelInternal(req.body);
        return res.json(result);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Internal helper for reuse
 */
export async function registerModelInternal(body: any) {
    const {
        userAddress,
        model_name,
        description,
        model_type,
        price_per_inference,
        framework,
        model_file,
        requirement_file,
        input_schema,
        output_schema,
        example_input,
        example_output,
        proof
    } = body;

    // Validate required fields
    if (!userAddress || !model_name || !model_type || !price_per_inference || !proof) {
        return { success: false, error: "Missing required fields" };
    }

    // Hash example inputs/outputs
    const example_input_hash = "0x" + sha256(example_input);
    const example_output_hash = "0x" + sha256(example_output);

    // Format proof
    const formattedProof = normalizeProof(proof);

    // Convert pricing to wei
    const pricingWei = BigInt(price_per_inference);

    // Contract call
    const tx = await registerModelGroth16({
        model_name,
        version: "1.0.0",
        model_type,
        pricing_per_inference: pricingWei,
        example_input_hash,
        example_output_hash,
        ...formattedProof
    });

    return {
        success: true,
        tx_hash: tx.hash
    };
}
