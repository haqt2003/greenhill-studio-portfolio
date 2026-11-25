import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Header, footer and generated assets all use this one approved logo.
const publicURL = new URL('../public/', import.meta.url);
const logo = await readFile(new URL('logo-greenhill-ribbon-symbol.svg', publicURL), 'utf8');
const viewBox = logo.match(/viewBox="([^"]+)"/)?.[1];
if (!viewBox) throw new Error('The approved logo must have a viewBox.');
const artwork = logo.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

const socialCard = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>GreenHill Studio — Mobile and web products</title>
  <defs>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(234 70) rotate(57) scale(550 570)" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3e8b64" stop-opacity=".55"/>
      <stop offset="1" stop-color="#0d1110" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#a8ebc6" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#0d1110"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <svg x="84" y="94" width="100" height="31" viewBox="${viewBox}">${artwork}</svg>
  <text x="210" y="120" fill="#f3f7f4" font-family="Arial, sans-serif" font-size="28" font-weight="700">GreenHill Studio</text>
  <text x="84" y="322" fill="#f3f7f4" font-family="Arial, sans-serif" font-size="78" font-weight="700" letter-spacing="-4">Mobile &amp; web</text>
  <text x="84" y="408" fill="#a8ebc6" font-family="Georgia, serif" font-size="82" font-style="italic">products.</text>
  <text x="88" y="508" fill="#aebbb3" font-family="Arial, sans-serif" font-size="24">Designed and built in Vietnam</text>
  <path d="M780 520c90-170 196-242 340-250" fill="none" stroke="#79d5a7" stroke-opacity=".36" stroke-width="2"/>
  <path d="M728 580c120-208 242-291 445-316" fill="none" stroke="#79d5a7" stroke-opacity=".18" stroke-width="2"/>
</svg>
`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0d1110"/>
  <svg x="5" y="23.7073" width="54" height="16.5854" viewBox="${viewBox}">${artwork}</svg>
</svg>
`;

const cardPNG = await sharp(Buffer.from(socialCard)).png().toBuffer();
await Promise.all([
  writeFile(new URL('social-card.svg', publicURL), socialCard),
  // Keep the previous URL updated as well as the new cache-busting filename.
  writeFile(new URL('social-card.png', publicURL), cardPNG),
  writeFile(new URL('social-card-ribbon-v2.png', publicURL), cardPNG),
  writeFile(new URL('favicon.svg', publicURL), favicon),
  sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(new URL('favicon-32.png', publicURL).pathname),
  sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(new URL('apple-touch-icon.png', publicURL).pathname),
]);

// Multi-size ICO fallback for crawlers and browsers requesting /favicon.ico.
const sizes = [16, 32, 48];
const icons = await Promise.all(sizes.map(size => sharp(Buffer.from(favicon)).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
icons.forEach((icon, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(icon.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += icon.length;
});
await writeFile(new URL('favicon.ico', publicURL), Buffer.concat([directory, ...icons]));
console.log('Generated social cards, favicon variants and touch icon from the approved ribbon logo.');
