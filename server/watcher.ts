import * as fs from 'fs';
import * as path from 'path';
import chokidar from 'chokidar';

// Configuration
const WATCH_FOLDER = path.join(__dirname, 'watch'); // Folder to watch
const OUTPUT_FOLDER = path.join(__dirname, 'output'); // Folder to store output files
const FILE_EXTENSION = '.tf'; // Only process .tf files

// Set to keep track of processed files
const processedFiles = new Set<string>();

// Ensure the watch and output folders exist
if (!fs.existsSync(WATCH_FOLDER)) {
    fs.mkdirSync(WATCH_FOLDER, { recursive: true });
    console.log(`Created watch folder at ${WATCH_FOLDER}`);
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
    console.log(`Created output folder at ${OUTPUT_FOLDER}`);
}

// Initialize watcher
const watcher = chokidar.watch(WATCH_FOLDER, {
    persistent: true,
    ignoreInitial: false, // Process existing files at startup
    depth: 0,
    awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
    }
});

const defaultFiles = ['main.tf', 'variables.tf', 'output.tf'];

    defaultFiles.forEach(async (file) => {
        const filePath = path.join(OUTPUT_FOLDER, file);
        if (!fs.existsSync(filePath)) {
            await fs.promises.writeFile(filePath, '');
            console.log(`Created default file: ${filePath}`);
        }
    });

console.log(`Watching for new ${FILE_EXTENSION} files in ${WATCH_FOLDER}...`);

// Event handler for added files
watcher.on('add', async (filePath) => {
    if (path.extname(filePath).toLowerCase() !== FILE_EXTENSION) {
        console.log(`Ignored non-${FILE_EXTENSION} file: ${filePath}`);
        return;
    }

    if (processedFiles.has(filePath)) {
        console.log(`File already processed: ${filePath}`);
        return;
    }

    console.log(`New file detected: ${filePath}`);
    processedFiles.add(filePath);

    try {
        await regenerateTargetFiles();
    } catch (error) {
        console.error('Error regenerating target files:', error);
    }
});

// Handle errors
watcher.on('error', (error) => {
    console.error('Watcher error:', error);
});

/**
 * Function to regenerate the target files based on the order of the last number in the filename.
 * It groups files by their prefix (before the first underscore), sorts them by the last number,
 * clears the target file, and appends the sorted content.
 */
async function regenerateTargetFiles() {
    const groupedFiles: { [prefix: string]: string[] } = {};
    // Ensure default files exist in the output folder

    // Group files by prefix (the part before the first underscore)
    processedFiles.forEach((filePath) => {
        const baseName = path.basename(filePath, FILE_EXTENSION);
        const parts = baseName.split('_');
        const prefix = parts[0]; // Prefix is the first part before any underscore

        if (!groupedFiles[prefix]) {
            groupedFiles[prefix] = [];
        }
        groupedFiles[prefix].push(filePath);
    });

    // Process each group
    for (const prefix of Object.keys(groupedFiles)) {
        const files = groupedFiles[prefix];

        // Sort files based on the last number in the filename
        const sortedFiles = files.sort((a, b) => {
            const aBase = path.basename(a, FILE_EXTENSION);
            const bBase = path.basename(b, FILE_EXTENSION);

            const aParts = aBase.split('_');
            const bParts = bBase.split('_');

            const aNum = parseInt(aParts[aParts.length - 1], 10) || 0;
            const bNum = parseInt(bParts[bParts.length - 1], 10) || 0;

            return aNum - bNum;
        });

        const targetFilePath = path.join(OUTPUT_FOLDER, `${prefix}${FILE_EXTENSION}`);

        try {
            // Clear the target file
            await fs.promises.writeFile(targetFilePath, '');
            console.log(`Cleared target file: ${targetFilePath}`);

            // Append sorted content
            for (const filePath of sortedFiles) {
                const data = await fs.promises.readFile(filePath, 'utf8');
                const separator = `\n# ----- Content from ${path.basename(filePath)} -----\n`;
                const contentToAppend = `${separator}${data}\n`;
                await fs.promises.appendFile(targetFilePath, contentToAppend);
                console.log(`Appended content of ${path.basename(filePath)} to ${targetFilePath}`);
            }

            console.log(`Regenerated ${targetFilePath} with ordered content.`);
        } catch (err) {
            console.error(`Error processing group with prefix "${prefix}":`, err);
        }
    }
}

// Initial regeneration in case there are existing files
(async () => {
    try {
        // Read all existing files in the watch folder
        const files = await fs.promises.readdir(WATCH_FOLDER);
        for (const file of files) {
            const filePath = path.join(WATCH_FOLDER, file);
            if (path.extname(filePath).toLowerCase() === FILE_EXTENSION) {
                processedFiles.add(filePath);
            }
        }
        await regenerateTargetFiles();
    } catch (error) {
        console.error('Error during initial regeneration:', error);
    }
})();
