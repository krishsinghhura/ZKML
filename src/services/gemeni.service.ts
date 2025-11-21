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

  // Use the provided API key directly
  const API_KEY = "AIzaSyA592PToDB5Ni93N4O5a0wG-Ekb5ZGnsYc";
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Get the Gemini model
  const model = genAI.getGenerativeModel({ model: gemeniModelName });

  // Build the user prompt for Flask app generation
  const userQuery = `
You are an AI assistant. Generate a Python Flask app named "app.py" that does the following:
1. Load the pickle model "${modelFileName}" from the same folder.
2. Provide a POST endpoint "/predict".
3. Accept JSON input with keys ${modelInputs}.
4. Call model.predict(...) and return the result.
5. Always return JSON responses: {"success": true, "prediction": ..., "error": null} or on error {"success": false, "prediction": null, "error": "..."}.
6. Handle missing input keys and exceptions.
7. Include Flask in imports. Do not add any extra text or explanation.
Model Description: ${modelDescription}
Return the response strictly as JSON in the format {"app.py": "<full python code>"}.
`;

  console.log("Hitting Gemeni for Flask app generation...");

  // Single call to Gemini
  const interpretation = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: userQuery }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  // Extract the generated content from JSON
  const rawResponse = await interpretation.response.text();
  let appCode: string;

  try {
    const parsed = JSON.parse(rawResponse);
    if (!parsed["app.py"]) throw new Error("Missing 'app.py' key in Gemeni response");
    appCode = parsed["app.py"];
  } catch (err) {
    throw new Error(`Failed to parse Gemeni JSON response: ${err}`);
  }

  // Write app.py to folder
  const appPyPath = path.join(folderPath, "app.py");
  await fs.writeFile(appPyPath, appCode);

  // Append flask to requirements.txt
  const reqPath = path.join(folderPath, requirementsFileName);
  await fs.ensureFile(reqPath);
  const existingReq = await fs.readFile(reqPath, "utf-8");
  const deps = existingReq.split("\n").map(l => l.trim()).filter(Boolean);
  if (!deps.includes("flask")) deps.push("flask");
  await fs.writeFile(reqPath, deps.join("\n"));

  console.log(`Generated app.py at ${appPyPath}`);
  return appPyPath;
}