import fs from "fs-extra";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "upload");

export async function createNamedFolder(modelFileName: string, username = "krishna") {
  const baseName = path.parse(modelFileName).name; // remove extension
  let version = 0;
  let folderName = `${username}-${baseName}`;

  // Check existing folders and find next version
  while (await fs.pathExists(path.join(UPLOAD_DIR, version ? `${folderName}-v${version}` : folderName))) {
    version++;
  }

  if (version > 0) {
    folderName = `${folderName}-v${version}`;
  }

  const folderPath = path.join(UPLOAD_DIR, folderName);
  await fs.ensureDir(folderPath);

  return folderPath;
}
