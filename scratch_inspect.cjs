const fs = require('fs');

const p = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
for (const file of ['cards-all.json', 'cards-fr.json', 'cards-en.json', 'cards-jp.json']) {
  if (fs.existsSync(p + file)) {
    const raw = fs.readFileSync(p + file, 'utf8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : Object.values(data);
    console.log(`=== ${file} === count: ${arr.length}`);
    const sample = arr[0];
    console.log('Sample keys:', Object.keys(sample));
    
    // Find sample with cardmarket or tcgplayer
    const withCm = arr.find(x => x.cardmarket_url || x.cardmarketUrl || x.url_cardmarket || x.cm_url || (typeof x.links === 'object' && x.links?.cardmarket));
    const withTcg = arr.find(x => x.tcgplayer_url || x.tcgplayerUrl || x.url_tcgplayer || x.tcg_url || (typeof x.links === 'object' && x.links?.tcgplayer));
    
    console.log('Keys of first 3 items:');
    arr.slice(0, 3).forEach((item, idx) => {
      console.log(`Item ${idx}: id=${item.id}, code=${item.code || item.card_code || item.cardId}, name=${item.name}`);
      // Find all url/link related keys
      const urlKeys = Object.keys(item).filter(k => k.toLowerCase().includes('url') || k.toLowerCase().includes('market') || k.toLowerCase().includes('tcg') || k.toLowerCase().includes('link'));
      console.log(`  url-related keys:`, urlKeys.map(k => `${k}: ${item[k]}`));
    });
  }
}
