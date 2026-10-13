const fs = require('fs');
const path = require('path');

const src = 'C:/Users/LuffyVlg/.gemini/antigravity/brain/ff955f3e-d11e-4b2f-87d2-4508fd6675a1/.user_uploaded/media_1791372016396.png';
const buffer = fs.readFileSync(src);

const root = path.join(__dirname, '..');
fs.writeFileSync(path.join(root, 'public/logo.png'), buffer);
fs.writeFileSync(path.join(root, 'public/icon-192.png'), buffer);
fs.writeFileSync(path.join(root, 'public/icon-512.png'), buffer);
fs.writeFileSync(path.join(root, 'src/assets/logo.png'), buffer);

const base64 = 'data:image/png;base64,' + buffer.toString('base64');
const tsContent = `export const SITE_LOGO = "${base64}";\nexport default SITE_LOGO;\n`;
fs.writeFileSync(path.join(root, 'src/assets/logoBase64.ts'), tsContent);

console.log('Successfully updated logo across public/ and src/assets/, size:', buffer.length, 'bytes');
