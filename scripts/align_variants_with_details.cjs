const fs = require('fs');
const path = require('path');

const detailsDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/details';
const dbPath = path.join(__dirname, '../src/data/optcg_complete_database.json');
const linksPath = path.join(__dirname, '../src/data/card_links.json');
const varsPath = path.join(__dirname, '../src/data/variants.json');

console.log('Loading details from', detailsDir);
const files = fs.readdirSync(detailsDir);

// Map of all detail files: filename -> data
const detailFiles = new Map();
// Map of base code -> base json data
const baseData = new Map();
// Map of image basename -> detail data
const byImageBasename = new Map();

files.forEach(f => {
  if (!f.endsWith('.json')) return;
  try {
    const d = JSON.parse(fs.readFileSync(path.join(detailsDir, f), 'utf8'));
    detailFiles.set(f.toLowerCase(), d);
    if (!f.match(/-v\d+\.json$/i)) {
      baseData.set(f.replace(/\.json$/i, '').toUpperCase(), d);
    }
    if (d.image_path) {
      const b = path.basename(d.image_path).toLowerCase();
      byImageBasename.set(b, d);
    }
  } catch (e) {}
});

console.log(`Loaded ${detailFiles.size} detail files, ${baseData.size} base files, ${byImageBasename.size} images`);

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
const variants = JSON.parse(fs.readFileSync(varsPath, 'utf8'));

console.log(`Loaded ${db.length} cards from database`);

let matchByImg = 0;
let matchByTourney = 0;
let matchByVNum = 0;
let matchByBase = 0;
let updatedCount = 0;

db.forEach(c => {
  const code = (c.card_code || c.id.match(/([A-Z0-9]+-[0-9]+)/i)?.[1] || '').toUpperCase();
  if (!code) return;

  const base = baseData.get(code);
  const allVars = base?.all_variants || [];

  const imgBase = c.image_url ? path.basename(c.image_url).toLowerCase() : '';
  const idLow = c.id.toLowerCase();
  const setLow = (c.set || '').toLowerCase();

  let matchedVariantData = null;
  let matchedFile = null;

  // 1. DIRECT IMAGE MATCH with a variant file
  if (imgBase && byImageBasename.has(imgBase)) {
    const d = byImageBasename.get(imgBase);
    if (d.code && d.code.toUpperCase() === code) {
      matchedVariantData = d;
      matchedFile = `${d.code}-${d.variant_version}.json`;
      matchByImg++;
    }
  }

  // 2. CHAMPIONSHIP / TOURNAMENT / SPECIAL PROMO MATCH
  const isTourney = idLow.includes('champ') || idLow.includes('cup') || idLow.includes('treasure') || 
                    idLow.includes('3on3') || idLow.includes('celebration') || idLow.includes('winner') ||
                    setLow.includes('championship') || setLow.includes('treasure cup');

  if (!matchedVariantData && isTourney && allVars.length > 0) {
    // Look for specific championship series
    let target = allVars.find(v => {
      const n = (v.name || '').toLowerCase();
      const cm = (v.cardmarket_url || '').toLowerCase();
      if ((idLow.includes('champ2025') || setLow.includes('2025')) && 
          (n.includes('cs 25') || n.includes('championship 2025') || (n.includes('2025') && cm.includes('special-tournaments')) || n.includes('1st place'))) return true;
      if ((idLow.includes('champ2024') || setLow.includes('2024')) && 
          (n.includes('cs 2024') || n.includes('cs 24') || n.includes('championship 2024') || (n.includes('2024') && cm.includes('special-tournaments')))) return true;
      if ((idLow.includes('champ2023') || setLow.includes('2023')) && 
          (n.includes('cs 2023') || n.includes('championship 2023') || (n.includes('2023') && cm.includes('special-tournaments')) || n.includes('serial number'))) return true;
      if ((idLow.includes('champ2022') || setLow.includes('2022')) && 
          (n.includes('cs 2022') || n.includes('championship 2022') || (n.includes('2022') && cm.includes('special-tournaments')) || n.includes('serial number') || n.includes('gift collection 2023'))) return true;
      if ((idLow.includes('champ2026') || setLow.includes('2026')) && 
          (n.includes('cs 26') || n.includes('championship 2026') || (n.includes('2026') && cm.includes('special-tournaments')))) return true;
      if ((idLow.includes('treasure') || setLow.includes('treasure cup')) && n.includes('treasure cup')) return true;
      if (idLow.includes('3on3') && (n.includes('3on3') || n.includes('3 on 3') || cm.includes('special-tournaments'))) return true;
      return false;
    });

    if (!target) {
      // Find ANY tournament variant in allVars
      target = allVars.find(v => {
        const cm = (v.cardmarket_url || '').toLowerCase();
        const n = (v.name || '').toLowerCase();
        return cm.includes('special-tournaments') || n.includes('championship') || n.includes('serial number') || n.includes('top players');
      });
    }

    if (target) {
      matchedFile = target.file;
      matchedVariantData = detailFiles.get(target.file.toLowerCase());
      matchByTourney++;
    }
  }

  // 3. VARIANT NUMBER IN ID for regular expansions (-2-XX, -3-XX, -4-XX, etc.)
  if (!matchedVariantData && allVars.length > 0) {
    const vMatch = idLow.match(/-([2-9])-(\d+)$/);
    if (vMatch) {
      const vNum = parseInt(vMatch[1], 10);
      const target = allVars.find(v => v.variant_index === vNum || v.variant_version === 'v' + vNum);
      if (target) {
        matchedFile = target.file;
        matchedVariantData = detailFiles.get(target.file.toLowerCase());
        matchByVNum++;
      }
    }
  }

  // 4. BASE V1 VARIANT
  if (!matchedVariantData && allVars.length > 0) {
    const v1 = allVars.find(v => v.variant_version === 'v1');
    if (v1) {
      matchedFile = v1.file;
      matchedVariantData = detailFiles.get(v1.file.toLowerCase());
      matchByBase++;
    }
  }

  // Apply updates if matched
  if (matchedVariantData && matchedFile) {
    const prevCm = c.cardmarket_url;
    const prevFile = c.detail_file;

    c.detail_file = matchedFile;
    c.variant = matchedVariantData.variant_index || parseInt((matchedVariantData.variant_version || 'v1').replace('v', ''), 10) || 1;
    c.variant_version = matchedVariantData.variant_version;
    c.variant_name = matchedVariantData.variant_name || matchedVariantData.name;
    
    if (matchedVariantData.cardmarket_url) {
      c.cardmarket_url = matchedVariantData.cardmarket_url;
    }
    if (matchedVariantData.cardmarket_url_jp) {
      c.cardmarket_url_jp = matchedVariantData.cardmarket_url_jp;
    }
    if (matchedVariantData.tcgplayer_url) {
      c.tcgplayer_url = matchedVariantData.tcgplayer_url;
    }

    // If it's a tournament or variant > 1, update art_type
    if (c.variant > 1 || isTourney) {
      c.art_type = 'ALT_ART';
      c.variant_label = c.variant_name;
    }

    if (prevCm !== c.cardmarket_url || prevFile !== c.detail_file) {
      updatedCount++;
    }

    // Also update card_links
    if (!links.byId) links.byId = {};
    links.byId[c.id] = {
      cm: c.cardmarket_url,
      cm_jp: c.cardmarket_url_jp || null,
      tcg: c.tcgplayer_url || null
    };

    if (imgBase) {
      if (!links.byBasename) links.byBasename = {};
      const lang = c.language || 'en';
      if (!links.byBasename[imgBase]) links.byBasename[imgBase] = {};
      links.byBasename[imgBase][lang] = {
        cm: c.cardmarket_url,
        cm_jp: c.cardmarket_url_jp || null,
        tcg: c.tcgplayer_url || null
      };
      // Also ensure default entry
      if (!links.byBasename[imgBase].en) {
        links.byBasename[imgBase].en = links.byBasename[imgBase][lang];
      }
      if (!links.byBasename[imgBase].fr) {
        links.byBasename[imgBase].fr = links.byBasename[imgBase][lang];
      }
    }
  }
});

console.log('Alignment statistics:');
console.log('Matches by image:', matchByImg);
console.log('Matches by tournament/championship:', matchByTourney);
console.log('Matches by variant index:', matchByVNum);
console.log('Matches by base v1:', matchByBase);
console.log('Total updated cards in DB:', updatedCount);

// Verify sample test cases
const checkIds = [
  'en-champ2025-ST21-015-reg-14',
  'en-champ2025-ST21-015-2-15',
  'en-champ2025-ST21-015-3-16',
  'jp-champ2022-ST01-001-reg-4',
  'jp-champ2022-ST01-013-reg-6',
  'jp-champ2023-OP01-025-reg-3',
  'jp-champ2023-OP01-120-reg-8',
  'en-st21-ST21-015-reg-29',
  'en-st21-ST21-015-2-30'
];

console.log('\n--- VERIFICATION OF SAMPLE CARDS ---');
checkIds.forEach(id => {
  const card = db.find(c => c.id === id);
  if (card) {
    console.log(JSON.stringify({
      id: card.id,
      name: card.name,
      variant_name: card.variant_name,
      variant: card.variant,
      detail_file: card.detail_file,
      cm: card.cardmarket_url,
      price: card.price_eur
    }, null, 2));
  }
});

// Save updated files
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Saved updated optcg_complete_database.json');

fs.writeFileSync(linksPath, JSON.stringify(links, null, 2), 'utf8');
console.log('Saved updated card_links.json');
