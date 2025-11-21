import fs from "fs-extra";
import path from "path";
import pinataSDK from "@pinata/sdk";

const PINATA_API_KEY = process.env.PINATA_API_KEY || "";
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || "";

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error("Pinata API key and secret must be set in environment variables");
}

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
//55b5a81ed79cc583de29
//70089001412cb9630a1b8e657c371a116c3cc2cc2a9cab92ebd789ab3bfc461f

/**
 * Uploads a local folder to IPFS via Pinata.
 * @param folderPath Absolute or relative path to the folder
 * @param folderName Name to use for the folder on IPFS
 * @returns CID string of the uploaded folder
 */
export async function uploadFolderToIPFS(folderPath: string, folderName: string): Promise<string> {
  // Ensure the folder exists
  if (!(await fs.pathExists(folderPath))) {
    throw new Error(`Folder does not exist: ${folderPath}`);
  }

  // Collect all files recursively
  const collectFiles = async (dir: string, basePath = ""): Promise<{ path: string; content: Buffer }[]> => {
    const entries = await fs.readdir(dir);
    const files: { path: string; content: Buffer }[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        files.push(...(await collectFiles(fullPath, path.join(basePath, entry))));
      } else if (stat.isFile()) {
        const content = await fs.readFile(fullPath);
        files.push({ path: path.join(basePath, entry), content });
      }
    }

    return files;
  };

  const files = await collectFiles(folderPath);

  // Pin folder to IPFS
  const result = await pinata.pinFromFS(folderPath, {
    pinataMetadata: {
      name: folderName,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  });

  // Returns the IPFS hash (CID)
  return result.IpfsHash;
}
