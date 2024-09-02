#!/usr/bin/env node
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";

const dir = process.argv[2];
const timestamp = Date.now();

if (!dir) {
  throw new Error("no directory provided");
}

function getFileExtension(filename: string) {
  return path.extname(filename).slice(1);
}

async function listAllFiles(dir: string) {
  let result: string[] = [];
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      result = result.concat(await listAllFiles(filePath));
    } else {
      result.push(filePath);
    }
  }

  return result;
}

async function calculateFileExtensionsPercentages(dir: string) {
  const files = await listAllFiles(dir);
  const extensionCount: { [key: string]: number } = {};
  let totalFiles = files.length;

  files.forEach((file) => {
    const ext = getFileExtension(file);
    if (ext) {
      extensionCount[ext] = (extensionCount[ext] || 0) + 1;
    }
  });

  for (const [ext, count] of Object.entries(extensionCount)) {
    const percentage = ((count / totalFiles) * 100).toFixed();
    console.log(
      "💨 " + chalk.cyan(`${ext}`) + " | " + chalk.cyanBright(`${percentage}%`)
    );
  }
}

(async () => {
  console.log("╼".repeat(50));
  console.log("\n✨ Here is the result\n");
  await calculateFileExtensionsPercentages(dir);
  console.log(`\n🔥 Done in ${Date.now() - timestamp}ms\n`);
  console.log("╼".repeat(50));
})();
