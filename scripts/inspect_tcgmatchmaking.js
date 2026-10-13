import fs from 'fs';

const contentPath = 'C:\\Users\\LuffyVlg\\.gemini\\antigravity\\brain\\ff955f3e-d11e-4b2f-87d2-4508fd6675a1\\.system_generated\\steps\\3059\\content.md';
const content = fs.readFileSync(contentPath, 'utf8');

console.log('Length:', content.length);
console.log('Preview:');
console.log(content.slice(0, 3000));
