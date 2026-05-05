import fs from 'fs';
import path from 'path';

const versionFilePath = path.join(process.cwd(), 'version.json');
const publicVersionPath = path.join(process.cwd(), 'public', 'version.json');

const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));

// Incrementar sub-versión (build)
const [major, minor, patch] = versionData.version.split('.').map(Number);
const newPatch = patch + 1;
const newVersion = `${major}.${minor}.${newPatch}`;

const now = new Date();
const buildDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${now.getHours()}${now.getMinutes()}`;

versionData.version = newVersion;
versionData.build = buildDate;

// 🛡️ ESCRITURA DUAL: Raíz (para imports) y Public (para fetch del servidor)
const finalJson = JSON.stringify(versionData, null, 2);
fs.writeFileSync(versionFilePath, finalJson);
fs.writeFileSync(publicVersionPath, finalJson);

console.log(`✅ [NEXUS]: Versión sincronizada a ${newVersion} en Raíz y Public.`);
