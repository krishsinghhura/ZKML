import { Request, Response } from "express";
import path from "path";
import { NodeSSH } from "node-ssh";
import { uploadFolderToIPFS } from "../utils/ipfs.util";
import fs from "fs-extra";
import { User, Model } from "../DBmodel/model";

const ssh = new NodeSSH();

const EC2_HOST = process.env.EC2_HOST!;
const EC2_USERNAME = process.env.EC2_USERNAME!;
const EC2_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpgIBAAKCAQEAsaTEmHCIqOrLm2uw9SvbsBDpCD3+70V6TxtjBjz8VI1qY+i8
0uXTO/Aw0qVJURD335/S0axQ+IrqtrnhxDoQi6Yd0P8cp8VCZB3PUtUkO2fncjgJ
siAGSO6hUSU6hVriePhsDlePRle1QRWNo9gT157sLAHfBZx1TEhmw5OXuudv69rL
fssra8w7yt8ww5e28UwnRk0Lll8JhKVXczgIljQ/w2GHfI06YB7Bd4fBxLZzR5SH
ncBQHBI6/hXSl7ma8AesaDDZXV9j8TJwh8X6PfaXSGliOe5TJi/wUlFsu0twpRCB
C9ntZb4n31hMTucvk7/diF34JXGwPcf6MaKneQIDAQABAoIBAQCxibSZjU5nU1Ft
4TEXtl93FU9wV1VkGJHmYb6Ty3t7nWHIvB+KvvpfmuuQenRNuqGgMwDlYEwEOgHd
4ORL0qQajUibSXuACNsTZ99+L1porK1ZL7ww82SUmzlJ+eUExhI1SEHmC4g7iwix
JTNLnnYmNsReLviPiRCJzoo1yFoKBfxDBuR35gvAYja9UaHV1oCrVc0UifV6rQDi
6b9B1U3mbqKlmxNrhlb8qHraVR/8m21gjPP8ncRirezcyou6aaJJmNE5g2QMXnR3
85cicM/m1w93VLAGOcIIvdRIFFqn4oXqotSPZ5GEBr01O09YHNYtWtUdOpuq3RaH
REk61E0pAoGBAOSN17Ex7sDzv/43sZGRrIBaiegD8lvIel7OIUn6TpSendICwwCO
cQUF7gSKgDOwUX2ILv4I+4FV7Ngggwee3OOiu+psro+vdvi8xo0Nqu1kaMKmUKWW
B6MwF0TYUXVgM6C3BPl2JfmtRdYTaTigoqxN4FppJQUgBFwWJcFDFuorAoGBAMb5
2RSROAxrqG+jE5wuAEs1+2lUQk4qw/hMHaAZGKs+Dlp5hEAA+z/yw+tDGFpA+Cmd
Hh5xS8nO9mJYx6xNWeUu4CMvm2fYoEGn2PaU6RUXIAIGcXp1KfewPnAPRXzwrtaL
3jWpTrvGkihl0WazKw80c+quiH/u3zmrWPWPbhbrAoGBAIug9FL2tGwA/hxrHfpW
ytInffTW5GuaUNg2ijPNzdASD0zMDyH546Yz9zOjAauSXlaYqkzcY/qh6e4n/qTb
MwuG0dLnzsVNZxuTCKIH5ZLeMvon7UEcJVJXAQA4P5u7yA65gTp+KbkdWHrupOvJ
h1hIw3W4ors80i0IAszNFeS9AoGBAKXz1H428ExLrlwN41krdMtF5r5erD6NpIz+
zuash8qrI0WKfCb1qpgXXhhmCXWdIl1y0aAKVm+m0hAMg9zNVuCzS/WMy0y9fEvG
NkrSv+P7OZL21MaR2cLfl/PWiNo/01LVrSuMXkJ2x4gyA4hofs1briJaFza8gCmV
I8kLK4KpAoGBALvs9sBHyHWGjx9RVTlnvnMj3vb7iOLmvmTA2LB2IByqCSG3ldsl
tTi4KOn00+mJXmXIaLeTr/b8F+NoprZOfUTbz/5M3vO1zvv2mE+8aV/F0S/Hs4cc
qAgAwt22cGlgtRD2jTuIoYzT0ZpPbdmM9eMazIIrWUYKGz5B3JWIuJqL
-----END RSA PRIVATE KEY-----`;

const EC2_TARGET_DIR = process.env.EC2_TARGET_DIR!;

export const deployFolder = async (req: Request, res: Response) => {
  try {
    const { folderName } = req.body;

    if (!folderName) {
      return res.status(400).json({
        success: false,
        message: "folderName is required.",
      });
    }

    const model = await Model.findOne({ folder: folderName });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: `No model found with folder '${folderName}'.`,
      });
    }

    const localFolderPath = path.join("upload", folderName);

    if (!(await fs.pathExists(localFolderPath))) {
      return res.status(404).json({
        success: false,
        message: `Local folder '${folderName}' does not exist.`,
      });
    }

    const ipfsCid = await uploadFolderToIPFS(localFolderPath, folderName);
    console.log("IPFS CID:", ipfsCid);

    await ssh.connect({
      host: EC2_HOST,
      username: EC2_USERNAME,
      privateKey: EC2_PRIVATE_KEY,
    });

    const remoteFolder = `${EC2_TARGET_DIR}/${folderName}`;

    await ssh.execCommand(`mkdir -p ${remoteFolder}`);

    console.log("Uploading folder to EC2...");
    await ssh.putDirectory(localFolderPath, remoteFolder, {
      recursive: true,
      concurrency: 5,
      validate: () => true,
      tick: (local, remote, error) => {
        if (error) console.error(`Upload error:`, local);
      },
    });

    await ssh.execCommand(`chmod +x ${remoteFolder}/deployment.sh`);

    console.log("Running deployment.sh...");
    const output = await ssh.execCommand(
      `cd ${remoteFolder} && bash deployment.sh`
    );

    ssh.dispose();

    // NEW HARDCODED ENDPOINT
    const endpointUrl = "http://13.203.86.149:5000/predict";

    model.set({
      deployed: true,
      port: 5000,
      routes: ["/predict"],
      ipfsCid,
      ec2Path: remoteFolder,
      endpointUrl, // New DB field
    });

    await model.save();

    return res.status(200).json({
      success: true,
      message: "Deployment completed successfully.",
      data: {
        ec2Path: remoteFolder,
        ipfsCid,
        endpointUrl,
        deploymentLogs: output.stdout,
        updatedModel: model,
      },
    });
  } catch (error: any) {
    console.error("Deployment error:", error);
    ssh.dispose();

    return res.status(500).json({
      success: false,
      message: "Deployment failed.",
      error: error.message,
    });
  }
};
