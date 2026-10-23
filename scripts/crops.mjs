// Builds phone-readable detail crops from the 1600x1000 product screenshots.
// Run: node scripts/crops.mjs
import sharp from 'sharp';

const CROPS = [
  { src: 'dashboard', name: 'dashboard', left: 248, top: 90, width: 600, height: 500 },
  { src: 'items', name: 'items', left: 248, top: 90, width: 760, height: 520 },
  { src: 'storage-units', name: 'storage', left: 248, top: 90, width: 640, height: 520 },
  { src: 'cases', name: 'cases', left: 248, top: 200, width: 560, height: 620 },
  { src: 'tradeup', name: 'tradeup', left: 248, top: 555, width: 620, height: 420 },
];

// Items: name column plus float and price columns, stitched so phones see what each skin is worth.
{
  const src = 'src/assets/items.png';
  const top = 90, height = 520;
  const left = await sharp(src).extract({ left: 248, top, width: 440, height }).toBuffer();
  const right = await sharp(src).extract({ left: 1385, top, width: 190, height }).toBuffer();
  await sharp({ create: { width: 630, height, channels: 3, background: '#111113' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 440, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile('src/assets/crops/items.png');
  console.log('wrote items (stitched)');
}

for (const c of CROPS.filter((x) => x.name !== 'items')) {
  await sharp(`src/assets/${c.src}.png`)
    .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
    .png({ compressionLevel: 9 })
    .toFile(`src/assets/crops/${c.name}.png`);
  console.log('wrote', c.name);
}
