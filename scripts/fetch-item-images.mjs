// One-off: resolves the demo's item names against ByMykel/CSGO-API and saves 96px WebP thumbnails.
// Needs /tmp/skins_not_grouped.json and /tmp/stickers.json (see README). Run: node scripts/fetch-item-images.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const skins = JSON.parse(fs.readFileSync('/tmp/skins_not_grouped.json', 'utf8'));
const stickers = JSON.parse(fs.readFileSync('/tmp/stickers.json', 'utf8'));
const NAMES = {
  skins: [
    '★ Karambit | Slaughter (Factory New)', '★ Sport Gloves | Nocts (Field-Tested)',
    'Tec-9 | Cut Out (Factory New)', 'M4A1-S | Control Panel (Factory New)', 'AK-47 | Inheritance (Factory New)',
    'Glock-18 | Gamma Doppler (Factory New)', 'MP9 | Starlight Protector (Factory New)', 'Desert Eagle | Cobalt Disruption (Factory New)',
    'M4A4 | Temukau (Factory New)', 'R8 Revolver | Fade (Field-Tested)', 'MP9 | Starlight Protector (Battle-Scarred)',
    'AK-47 | Nightwish (Battle-Scarred)', 'Desert Eagle | Printstream (Well-Worn)', 'AK-47 | Aquamarine Revenge (Field-Tested)',
    'FAMAS | Bad Trip (Field-Tested)', '★ Falchion Knife | Slaughter (Minimal Wear)', '★ Falchion Knife | Fade (Factory New)',
    '★ Falchion Knife | Case Hardened (Battle-Scarred)', '★ Falchion Knife | Crimson Web (Well-Worn)', '★ Falchion Knife | Night (Well-Worn)',
    '★ Bowie Knife | Tiger Tooth (Factory New)', 'R8 Revolver | Fade (Factory New)', 'USP-S | The Traitor (Field-Tested)',
    'Glock-18 | Shinobu (Factory New)', 'MP7 | Abyssal Apparition (Factory New)', 'StatTrak™ Five-SeveN | Fowl Play (Factory New)',
    'M4A1-S | Decimator (Field-Tested)', 'P90 | Trigon (Field-Tested)', 'M4A4 | Poly Mag (Minimal Wear)',
    'Negev | Drop Me (Field-Tested)', 'FAMAS | Meow 36 (Battle-Scarred)', 'AK-47 | Redline (Field-Tested)', 'AWP | Asiimov (Field-Tested)',
  ],
  stickers: [
    'Sticker | Aerial | Katowice 2019', 'Sticker | Miami Stabbyfish', 'Sticker | Blue Lethal', 'Sticker | Green Shark Shooter',
    'Sticker | ableJ | Katowice 2019', 'Sticker | Yellow Bombster', 'Sticker | Red Cyclawps', 'Sticker | Purple Cyclawps',
  ],
};
const find = (list, name) => {
  const strip = (s) => s.replace(/StatTrak™ /, '');
  return list.find((x) => x.name === name) ?? list.find((x) => strip(x.name) === strip(name)) ?? list.find((x) => x.name.includes(name.replace('Sticker | ', '')));
};
const baseWeapons = JSON.parse(fs.readFileSync('/tmp/base_weapons.json', 'utf8'));
const manifest = {};
{
  const hit = baseWeapons.find((x) => x.name === 'Butterfly Knife');
  const res = await fetch(hit.image);
  await sharp(Buffer.from(await res.arrayBuffer())).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82 }).toFile('public/demo/butterfly-knife-vanilla.webp');
  manifest['★ Butterfly Knife | Vanilla'] = { file: '/demo/butterfly-knife-vanilla.webp', color: '#eb4b4b', rarity: 'Extraordinary', kind: 'skin' };
}
for (const [kind, list, names] of [['skin', skins, NAMES.skins], ['sticker', stickers, NAMES.stickers]]) {
  for (const name of names) {
    const hit = find(list, name);
    if (!hit) { console.log('MISS', name); continue; }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const res = await fetch(hit.image);
    if (!res.ok) { console.log('FAIL', name, res.status); continue; }
    await sharp(Buffer.from(await res.arrayBuffer())).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82 }).toFile(`public/demo/${slug}.webp`);
    manifest[name] = { file: `/demo/${slug}.webp`, color: hit.rarity?.color ?? null, rarity: hit.rarity?.name ?? null, kind };
  }
}
fs.writeFileSync('src/mock/data/item-images.json', JSON.stringify(manifest, null, 2));
console.log(Object.keys(manifest).length, 'items');
