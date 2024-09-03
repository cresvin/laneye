#!/usr/bin/env node
import chalk from "chalk";
import fs from "fs/promises";
import { createSpinner } from "nanospinner";
import path from "path";

const dir = process.argv[2];
const timestamp = Date.now();
const ignoredDirectories = process.argv[3]?.split(" ") || [];

if (!dir) {
  throw new Error("no directory provided");
}

function getFileExtension(filename: string) {
  return path.extname(filename).slice(1);
}

async function listAllFiles(dir: string) {
  let result: string[] = [];

  const files = await fs.readdir(dir, { withFileTypes: true });
  const ignoredDirectoriesSet = new Set(ignoredDirectories);

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (!ignoredDirectoriesSet.has(file.name)) {
        result = result.concat(await listAllFiles(filePath));
      }
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

  // prettier-ignore
  const ignoredExtensions = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'ico', 'heic', 'raw',
    
    // Audio
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'aiff', 'alac',
    
    // Video
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp',
    
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
    
    // Archives/Compressed
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso',
    
    // System/Configuration
    'exe', 'dll', 'sys', 'ini', 'bat', 'sh', 'log', 'tmp', 'bak',
    
    // Fonts
    'ttf', 'otf', 'woff', 'woff2', 'eot'
  ]);

  files.forEach((file) => {
    const ext = getFileExtension(file).toLowerCase();
    if (ext && !ignoredExtensions.has(ext)) {
      extensionCount[ext] = (extensionCount[ext] || 0) + 1;
      totalFiles++;
    }
  });

  for (const [ext, count] of Object.entries(extensionCount)) {
    const percentage = ((count / totalFiles) * 100).toFixed();
    console.log(chalk.magentaBright(`│ ${ext} → ${percentage}%`));
  }
}

(async () => {
  const spinner = createSpinner(`Analyzing...`).start();
  await sleep(500);
  console.log("");
  try {
    await calculateFileExtensionsPercentages(dir);
    console.log(
      chalk.gray(
        `• Ignored directories: ${
          ignoredDirectories.length > 0 ? ignoredDirectories.join(", ") : "none"
        }`
      )
    );
    spinner.success({ text: `Done in ${Date.now() - timestamp}ms` });
  } catch (err) {
    if (err instanceof Error) {
      spinner.error({ text: `Error: ${err.message}` });
    }
  }
})();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
