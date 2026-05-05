import fs from 'fs';
import path from 'path';

const versionFilePath = path.join(process.cwd(), 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

// Incrementar sub-versión (build)
const [major, minor, patch] = versionData.version.split('.').map(Number);
const newPatch = patch + 1;
const newVersion = `${major}.${minor}.${newPatch}`;

const now = new Date();
const buildDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${now.getHours()}${now.getMinutes()}`;

versionData.version = newVersion;
versionData.build = buildDate;

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

console.log(`✅ [NEXUS]: Versión incrementada a ${newVersion} (Build: ${buildDate})`);
