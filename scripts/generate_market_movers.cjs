const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const variantsPath = path.join(ROOT, 'src/data/variants.json');
const metaPath = path.join(ROOT, 'src/data/price_sync_meta.json');
const outputPath = path.join(ROOT, 'src/data/market_movers.json');

function generateMarketMovers() {
  const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) {}
  }

  function buildMoversFor(langFilter = null) {
    const candidates = [];
    for (const v of variants) {
      if (langFilter && v.language !== langFilter) continue;
      const current = v.price_eur;
      const avg = v.price_avg7_eur;
      if (!current || !avg || current < 20 || avg < 20) continue;
      
      const diff = current - avg;
      const pct = (diff / avg) * 100;
      
      // Filter extreme anomalies
      if (current > 15000 || avg > 15000 || Math.abs(diff) > 10000) continue;
      if (pct > 250 || pct < -85) continue;
      if (Math.abs(diff) < 5) continue;
      
      const lang = (v.language || 'en').toLowerCase();
      let sub = v.card_code;
      if (v.variant_label && v.variant_label !== 'Base' && !v.variant_label.startsWith(v.card_code)) {
        sub += ' · ' + v.variant_label;
      } else if (v.variant_type && v.variant_type !== 'BASE') {
        sub += ' · ' + v.variant_type;
      }
      
      candidates.push({
        id: v.id,
        card_code: v.card_code,
        name: v.name,
        variant_label: v.variant_label || 'Base',
        subtitle: sub,
        rarity: v.rarity,
        language: lang,
        flag_url: lang === 'fr' ? '/media/flag-fr.png' : lang === 'jp' ? '/media/flag-jp.png' : '/media/flag-en.png',
        current_price: Math.round(current),
        previous_price: Math.round(avg),
        diff_eur: Math.round(diff),
        diff_percent: Math.round(pct * 10) / 10,
        image_url: v.image_url || v.image_path || (`https://img.egmanevents.com/optcg/${v.card_code}.webp`)
      });
    }

    const haussesRaw = candidates.filter(c => c.diff_eur > 0).sort((a, b) => b.diff_eur - a.diff_eur);
    const baissesRaw = candidates.filter(c => c.diff_eur < 0).sort((a, b) => a.diff_eur - b.diff_eur);

    function selectDiverse(list, limit = 3) {
      const selected = [];
      const seenChar = new Set();
      for (const item of list) {
        const charKey = item.name.toLowerCase().split('.')[0].split(' ')[0] + '-' + item.card_code;
        if (!seenChar.has(charKey)) {
          seenChar.add(charKey);
          selected.push(item);
          if (selected.length >= limit) break;
        }
      }
      if (selected.length < limit) {
        for (const item of list) {
          if (!selected.some(s => s.id === item.id)) {
            selected.push(item);
            if (selected.length >= limit) break;
          }
        }
      }
      return selected;
    }

    return {
      hausses: selectDiverse(haussesRaw, 3),
      baisses: selectDiverse(baissesRaw, 3)
    };
  }

  // Determine current formatted date in French
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateFormatted = now.toLocaleDateString('fr-FR', options);

  const marketMovers = {
    updated_at: meta.synchronized_at || now.toISOString(),
    date_label: dateFormatted,
    all: buildMoversFor(null),
    fr: buildMoversFor('fr'),
    en: buildMoversFor('en'),
    jp: buildMoversFor('jp')
  };

  fs.writeFileSync(outputPath, JSON.stringify(marketMovers, null, 2), 'utf8');
  console.log(`✓ market_movers.json généré avec succès (${outputPath})`);
  return marketMovers;
}

if (require.main === module) {
  generateMarketMovers();
}

module.exports = { generateMarketMovers };
