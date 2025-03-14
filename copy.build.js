const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'client/build');
const destination = path.join(__dirname, 'public');

function copyFolderSync(src, dest) {
    fs.rmSync(dest, { recursive: true, force: true }); // Cancella la destinazione esistente
    fs.mkdirSync(dest, { recursive: true }); // Crea la destinazione
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

copyFolderSync(source, destination);
console.log('Files copied successfully.');
