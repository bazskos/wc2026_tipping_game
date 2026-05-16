const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'summary.txt';

// Ezeket KIZÁRJUK, hogy ne fagyjon le a gép és tiszta maradjon a txt
const IGNORE_DIRS = ['node_modules', '.git', '.next', 'public', 'dist', '.vscode'];
const IGNORE_FILES = ['package-lock.json', 'summary.txt', 'summary.js', '.DS_Store'];
const IGNORE_EXTS = ['.png', '.jpg', '.jpeg', '.ico', '.svg', '.gif', '.mp4', '.woff', '.woff2'];

let output = '=========================================\n';
output += '          PROJEKT FÁJLSTRUKTÚRA          \n';
output += '=========================================\n\n';

function buildTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    
    // Fájlok rendezése (mappák előre)
    files.sort((a, b) => {
        const isDirA = fs.statSync(path.join(dir, a)).isDirectory();
        const isDirB = fs.statSync(path.join(dir, b)).isDirectory();
        if (isDirA && !isDirB) return -1;
        if (!isDirA && isDirB) return 1;
        return a.localeCompare(b);
    });

    files.forEach((file, index) => {
        if (IGNORE_DIRS.includes(file) || IGNORE_FILES.includes(file)) return;
        
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        
        output += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
        
        if (stats.isDirectory()) {
            buildTree(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}

buildTree('.');

output += '\n\n=========================================\n';
output += '             FÁJLOK TARTALMA             \n';
output += '=========================================\n';

function readFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        if (IGNORE_DIRS.includes(file) || IGNORE_FILES.includes(file)) continue;
        
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            readFiles(filePath);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (IGNORE_EXTS.includes(ext)) continue;
            
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                output += `\n\n--- ${filePath.replace(/\\/g, '/')} ---\n\n`;
                output += content;
            } catch (err) {
                output += `\n\n--- ${filePath.replace(/\\/g, '/')} ---\n\n[Nem olvasható vagy bináris fájl]\n`;
            }
        }
    }
}

readFiles('.');

fs.writeFileSync(OUTPUT_FILE, output);
console.log(`\n✅ Kész! A projekt összefoglalója elmentve ide: ${OUTPUT_FILE}\n`);