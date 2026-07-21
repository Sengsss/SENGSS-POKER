import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#16171d"/>
  <text x="256" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="300"
    text-anchor="middle" fill="#ffffff">&#9824;</text>
</svg>
`;

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon-32x32.png', size: 32 },
];

for (const { file, size } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(publicDir, file));
  console.log(`generated ${file}`);
}

// maskable icon: same design but with safe-zone padding so Android doesn't clip it
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#16171d"/>
  <text x="256" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="200"
    text-anchor="middle" fill="#ffffff">&#9824;</text>
</svg>
`;
await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
console.log('generated pwa-maskable-512x512.png');
