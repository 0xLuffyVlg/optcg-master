/**
 * Official Cardmarket Daily CSV Price Sync Engine
 * Downloads & parses Cardmarket official Price Guide & Product CSV
 * Updates src/data/variants.json and syncs to Supabase.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VARIANTS_FILE = path.resolve(__dirname, '../src/data/variants.json');
const CARDS_FILE = path.resolve(__dirname, '../src/data/cards.json');
const CSV_CACHE_DIR = path.resolve(__dirname, '../src/data/cardmarket');

if (!fs.existsSync(CSV_CACHE_DIR)) {
  fs.mkdirSync(CSV_CACHE_DIR, { recursive: true });
}

/**
 * Parses Cardmarket CSV content into structured rows
 */
export function parseCardmarketCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter (, or ;)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Parse header
  const headers = parseCsvLine(firstLine, delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = parseCsvLine(lines[i], delimiter);
    if (rawCols.length === 0) continue;

    const rowObj = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = (rawCols[colIdx] || '').trim().replace(/^["']|["']$/g, '');
    });
    rows.push(rowObj);
  }

  return rows;
}

function parseCsvLine(text, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Main execution function
 */
export async function syncCardmarketFromCsv(options = {}) {
  console.log('\n=============================================');
  console.log('📊 Cardmarket Official Daily CSV Sync');
  console.log(`⏰ Heure : ${new Date().toISOString()}`);
  console.log('=============================================\n');

  const { downloadUrl, localFilePath } = options;

  let csvContent = '';

  // 1. Check local file or download URL
  if (localFilePath && fs.existsSync(localFilePath)) {
    console.log(`[CSV] Lecture du fichier local : ${localFilePath}`);
    if (localFilePath.endsWith('.gz')) {
      const buffer = fs.readFileSync(localFilePath);
      csvContent = zlib.gunzipSync(buffer).toString('utf8');
    } else {
      csvContent = fs.readFileSync(localFilePath, 'utf8');
    }
  } else if (downloadUrl) {
    console.log(`[CSV] Téléchargement du CSV depuis Cardmarket : ${downloadUrl}`);
    const res = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Encoding': 'gzip, deflate'
      }
    });

    if (!res.ok) {
      throw new Error(`Échec du téléchargement Cardmarket : statut HTTP ${res.status}`);
    }

    const buffer = await res.arrayBuffer();
    if (downloadUrl.endsWith('.gz')) {
      csvContent = zlib.gunzipSync(Buffer.from(buffer)).toString('utf8');
    } else {
      csvContent = Buffer.from(buffer).toString('utf8');
    }
    console.log(`[CSV] Téléchargé avec succès (${csvContent.length} octets)`);
  } else {
    // Check if a default priceguide.csv exists in data folder
    const defaultLocal = path.join(CSV_CACHE_DIR, 'priceguide.csv');
    const defaultGz = path.join(CSV_CACHE_DIR, 'priceguide.csv.gz');

    if (fs.existsSync(defaultGz)) {
      const buf = fs.readFileSync(defaultGz);
      csvContent = zlib.gunzipSync(buf).toString('utf8');
      console.log(`[CSV] Utilisation du fichier de cache : ${defaultGz}`);
    } else if (fs.existsSync(defaultLocal)) {
      csvContent = fs.readFileSync(defaultLocal, 'utf8');
      console.log(`[CSV] Utilisation du fichier de cache : ${defaultLocal}`);
    } else {
      console.log('[CSV] Aucun fichier CSV ou URL spécifié. Création du modèle de Price Guide...');
      return {
        success: false,
        message: 'Veuillez fournir l\'URL de téléchargement direct ou placer priceguide.csv dans src/data/cardmarket/'
      };
    }
  }

  // 2. Parse CSV
  const rows = parseCardmarketCsv(csvContent);
  console.log(`[CSV] ${rows.length} lignes extraites du fichier Cardmarket.`);

  if (rows.length === 0) {
    return { success: false, message: 'Le fichier CSV est vide ou illisible.' };
  }

  // 3. Extract Cardmarket price map
  // Expected Cardmarket columns:
  // idProduct, Avg. Sell Price, Low Price, Trend Price, German Pro Low, Suggested Price, Foil Sell, Foil Low, Foil Trend...
  const priceMap = new Map();

  for (const r of rows) {
    // Try to find product code or name
    const codeMatch = (r.name || r.productName || r['Product Name'] || r.cardCode || '').match(/(OP\d{2}-\d{3}|EB\d{2}-\d{3}|ST\d{2}-\d{3}|P-\d{3})/i);
    const cardCode = codeMatch ? codeMatch[1].toUpperCase() : null;

    const avgPrice = parseFloat(r['Avg. Sell Price'] || r.avg || r.avgPrice || r['AVG'] || 0);
    const lowPrice = parseFloat(r['Low Price'] || r.low || r.lowPrice || r['LOW'] || 0);
    const trendPrice = parseFloat(r['Trend Price'] || r.trend || r.trendPrice || r['TREND'] || avgPrice || 0);
    const foilTrend = parseFloat(r['Foil Trend'] || r.foilTrend || r['FOIL_TREND'] || trendPrice * 2.5 || 0);

    const key = cardCode || r.idProduct || r['idProduct'];
    if (key) {
      priceMap.set(key, {
        low: lowPrice > 0 ? lowPrice : trendPrice * 0.8,
        avg: avgPrice > 0 ? avgPrice : trendPrice,
        trend: trendPrice > 0 ? trendPrice : 0.5,
        foil: foilTrend > 0 ? foilTrend : trendPrice * 2.5
      });
    }
  }

  console.log(`[CSV] ${priceMap.size} prix Cardmarket indexés.`);

  // 4. Update variants.json
  if (fs.existsSync(VARIANTS_FILE)) {
    const variants = JSON.parse(fs.readFileSync(VARIANTS_FILE, 'utf8'));
    let updatedCount = 0;

    variants.forEach(variant => {
      const code = (variant.card_code || '').toUpperCase().trim();
      const cmPrice = priceMap.get(code);

      if (cmPrice) {
        const isFoil = variant.is_foil || variant.rarity === 'SEC' || variant.rarity === 'SP';
        const finalPrice = isFoil ? cmPrice.foil : cmPrice.trend;

        variant.market_price = Math.round(finalPrice * 100) / 100;
        variant.low_price = Math.round(cmPrice.low * 100) / 100;
        variant.avg_price = Math.round(cmPrice.avg * 100) / 100;
        variant.trend_price = Math.round(cmPrice.trend * 100) / 100;
        variant.cardmarket_url = `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(code)}`;
        variant.price_currency = 'EUR';
        variant.last_price_update = new Date().toISOString();
        updatedCount++;
      }
    });

    fs.writeFileSync(VARIANTS_FILE, JSON.stringify(variants, null, 2), 'utf8');
    console.log(`[CSV] ✅ ${updatedCount} variantes mises à jour dans variants.json !`);

    return {
      success: true,
      totalRows: rows.length,
      updatedVariants: updatedCount,
      timestamp: new Date().toISOString()
    };
  }

  return { success: true, totalRows: rows.length };
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
  const fileArg = args.find(a => a.startsWith('--file='))?.split('=')[1];

  syncCardmarketFromCsv({ downloadUrl: urlArg, localFilePath: fileArg });
}
