#!/usr/bin/env node
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
const dir = process.argv[2];
const timestamp = Date.now();
if (!dir) {
    throw new Error("no directory provided");
}
function getFileExtension(filename) {
    return path.extname(filename).slice(1);
}
async function listAllFiles(dir) {
    let result = [];
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            result = result.concat(await listAllFiles(filePath));
        }
        else {
            result.push(filePath);
        }
    }
    return result;
}
async function calculateFileExtensionsPercentages(dir) {
    const files = await listAllFiles(dir);
    const extensionCount = {};
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
        console.log("💨 " + chalk.cyan(`${ext}`) + " | " + chalk.cyanBright(`${percentage}%`));
    }
}
(async () => {
    console.log("╼".repeat(50));
    console.log("\n✨ Here is the result\n");
    await calculateFileExtensionsPercentages(dir);
    console.log(`\n🔥 Done in ${Date.now() - timestamp}ms\n`);
    console.log("╼".repeat(50));
})();
