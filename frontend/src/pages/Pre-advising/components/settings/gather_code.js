import fs from 'fs';
import path from 'path';

// 1. Target the root directory to capture frontend, backend, and root configs
const targetFolder = '.'; 
const outputPrefix = './combined_code_part_';

// 2. Expand allowed extensions to include Python, HTML, CSS, configs, and text files
const allowedExtensions = ['.js', '.jsx', '.py', '.html', '.css', '.json', '.txt'];
const MAX_CHARS_PER_FILE = 150000;

// 3. Ignore folders that contain caches, binaries, or unneeded static assets
const ignoredDirs = ['node_modules', '__pycache__', '.git', 'models', 'assets', 'public'];

let fileIndex = 1;
let currentSize = 0;
let currentPath = `${outputPrefix}${fileIndex}.txt`;

fs.writeFileSync(currentPath, `=== PART ${fileIndex} ===\n`);

function readFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip ignored directories entirely
      if (!ignoredDirs.includes(file)) {
        readFilesRecursively(filePath);
      }
    } else {
      // 4. CRITICAL SAFEGUARD: Do not read output files, or massive lock files
      if (file.startsWith('combined_code_part_') || file === 'package-lock.json') {
        return; 
      }

      if (allowedExtensions.includes(path.extname(file))) {
        const content = fs.readFileSync(filePath, 'utf8');
        const textToAdd = `\n\n========================================\n--- FILE: ${filePath} ---\n========================================\n\n${content}`;

        if (currentSize + textToAdd.length > MAX_CHARS_PER_FILE && currentSize > 0) {
          fileIndex++;
          currentPath = `${outputPrefix}${fileIndex}.txt`;
          fs.writeFileSync(currentPath, `=== PART ${fileIndex} ===\n`);
          currentSize = 0;
        }

        fs.appendFileSync(currentPath, textToAdd);
        currentSize += textToAdd.length;
        console.log(`Added: ${filePath} to Part ${fileIndex}`);
      }
    }
  });
}

readFilesRecursively(targetFolder);
console.log(`\nDone! Split into ${fileIndex} files.`);