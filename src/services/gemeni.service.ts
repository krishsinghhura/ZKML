import fs from "fs-extra";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GemeniParams {
  folderPath: string;
  modelFileName: string;
  requirementsFileName: string;
  modelInputs: string;
  modelDescription: string;
  gemeniModelName?: string;
}

export async function generateFlaskApp(params: GemeniParams): Promise<string> {
  const {
    folderPath,
    modelFileName,
    requirementsFileName,
    modelInputs,
    modelDescription,
    gemeniModelName = "gemini-2.5-flash",
  } = params;

  // Use API key
  const API_KEY = "AIzaSyA592PToDB5Ni93N4O5a0wG-Ekb5ZGnsYc";
  const genAI = new GoogleGenerativeAI(API_KEY);

  const model = genAI.getGenerativeModel({ model: gemeniModelName });

  // ------------------------------------------------------------------------------------------------
  // SUPER STRICT SYSTEM PROMPT FOR HIGH ACCURACY FLASK APP
  // ------------------------------------------------------------------------------------------------
  const userQuery = `
You are an expert Python ML deployment engineer. Generate a PRODUCTION-GRADE Flask app named "app.py".

Follow these HARD RULES:

──────────────────────────────────────────────────────────
🟥 **1. MODEL LOADING (VERY IMPORTANT)**
──────────────────────────────────────────────────────────
- The Flask app must load the pickle model file: "${modelFileName}"
- Load using:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
- MODEL_PATH = '${modelFileName}'
- If model is missing → set model_load_error and return proper error JSON
- Print clear load status logs

──────────────────────────────────────────────────────────
🟥 **2. ENDPOINT DESIGN**
──────────────────────────────────────────────────────────
Create a single POST endpoint:

    @app.route('/predict', methods=['POST'])

Functionality:
- Validate that model loaded correctly
- Accept JSON body
- Required input keys MUST be exactly:
${modelInputs}

- If missing keys → return:
  {"success": false, "prediction": null, "error": "Missing required keys in input: ..."}
  With status 400

- Input order MUST follow key order EXACTLY (critical for ML models)
- Model input MUST be converted into a 2D array: [[...]]
- Use: prediction = model.predict([features]).tolist()

──────────────────────────────────────────────────────────
🟥 **3. RESPONSE FORMAT (MANDATORY)**
──────────────────────────────────────────────────────────
ALL responses (success or error) MUST be JSON:
- SUCCESS:
  {"success": true, "prediction": ..., "error": null}

- ERROR:
  {"success": false, "prediction": null, "error": "<error message>"}

──────────────────────────────────────────────────────────
🟥 **4. IMPORTS**
──────────────────────────────────────────────────────────
MUST include:
import os
import pickle
from flask import Flask, request, jsonify

──────────────────────────────────────────────────────────
🟥 **5. SERVER CONFIG**
──────────────────────────────────────────────────────────
- host="0.0.0.0"
- debug=True (user wants debug ON)
- use_reloader=False
- port must be between 3001–3010
  You MUST choose a single fixed port in this range.

──────────────────────────────────────────────────────────
🟥 **6. NO EXTRA TEXT**
──────────────────────────────────────────────────────────
- DO NOT include explanations
- DO NOT include comments describing what you are doing EXCEPT meaningful code comments
- DO NOT wrap code in backticks
- Return EXACT JSON structure:

{
  "app.py": "<FULL PYTHON CODE>"
}

──────────────────────────────────────────────────────────
Model Description:
${modelDescription}
──────────────────────────────────────────────────────────
  `;

  console.log("Hitting Gemini for Flask app generation...");

  const interpretation = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userQuery }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const rawResponse = await interpretation.response.text();
  let appCode: string;

  try {
    const parsed = JSON.parse(rawResponse);
    if (!parsed["app.py"])
      throw new Error("Missing 'app.py' key in Gemini response");
    appCode = parsed["app.py"];
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON response: ${err}`);
  }

  // Write app.py to folder
  const appPyPath = path.join(folderPath, "app.py");
  await fs.writeFile(appPyPath, appCode);

  // Append Flask to requirements.txt
  const reqPath = path.join(folderPath, requirementsFileName);
  await fs.ensureFile(reqPath);
  const existingReq = await fs.readFile(reqPath, "utf-8");
  const deps = existingReq
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!deps.includes("flask")) deps.push("flask");
  await fs.writeFile(reqPath, deps.join("\n"));

  console.log(`Generated app.py at ${appPyPath}`);
  return appPyPath;
}
