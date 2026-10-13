const fs = require('fs');
const path = require('path');

const completeDbPath = path.join(__dirname, '../src/data/optcg_complete_database.json');
const cardsPath = path.join(__dirname, '../src/data/cards.json');
const variantsPath = path.join(__dirname, '../src/data/variants.json');

const rawDb = JSON.parse(fs.readFileSync(completeDbPath, 'utf8'));
let existingCards = [];
if (fs.existsSync(cardsPath)) {
  try {
    existingCards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  } catch (e) {}
}

console.log('Raw DB items:', rawDb.length);
console.log('Existing cards:', existingCards.length);

// Build a map of existing cards by card_code for quick preservation of translations / jp_name / custom data
const existingByCode = new Map();
for (const c of existingCards) {
  if (c && c.card_code) {
    existingByCode.set(c.card_code.toUpperCase(), c);
  }
}

// Japanese name mapping dictionary for popular characters
const JP_CHAR_MAP = {
  'monkey d. luffy': 'モンキー・D・ルフィ',
  'monkey.d.luffy': 'モンキー・D・ルフィ',
  'luffy': 'モンキー・D・ルフィ',
  'roronoa zoro': 'ロロノア・ゾロ',
  'zoro': 'ロロノア・ゾロ',
  'nami': 'ナミ',
  'usopp': 'ウソップ',
  'sanji': 'サンジ',
  'tony tony chopper': 'トニートニー・チョッパー',
  'tony tony.chopper': 'トニートニー・チョッパー',
  'chopper': 'トニートニー・チョッパー',
  'nico robin': 'ニコ・ロビン',
  'robin': 'ニコ・ロビン',
  'franky': 'フランキー',
  'brook': 'ブルック',
  'jinbe': 'ジンベエ',
  'trafalgar law': 'トラファルガー・ロー',
  'law': 'トラファルガー・ロー',
  'eustass "captain" kid': 'ユースタス・キッド',
  'eustass captain kid': 'ユースタス・キッド',
  'eustass.captain.kid': 'ユースタス・キッド',
  'kid': 'ユースタス・キッド',
  'shanks': 'シャンクス',
  'edward.newgate': 'エドワード・ニューゲート',
  'edward newgate': 'エドワード・ニューゲート',
  'whitebeard': 'エドワード・ニューゲート',
  'portgas.d.ace': 'ポートガス・D・エース',
  'portgas d. ace': 'ポートガス・D・エース',
  'ace': 'ポートガス・D・エース',
  'sabo': 'サボ',
  'donquixote doflamingo': 'ドンキホーテ・ドフラミンゴ',
  'doflamingo': 'ドンキホーテ・ドフラミンゴ',
  'crocodile': 'クロコダイル',
  'boa hancock': 'ボア・ハンコック',
  'hancock': 'ボア・ハンコック',
  'dracule mihawk': 'ジュラキュール・ミホーク',
  'mihawk': 'ジュラキュール・ミホーク',
  'bartholomew kuma': 'バーソロミュー・くま',
  'kuma': 'バーソロミュー・くま',
  'gecko moria': 'ゲッコー・モリア',
  'moria': 'ゲッコー・モリア',
  'marshall.d.teach': 'マーシャル・D・ティーチ',
  'marshall d. teach': 'マーシャル・D・ティーチ',
  'blackbeard': 'マーシャル・D・ティーチ',
  'teach': 'マーシャル・D・ティーチ',
  'enel': 'エネル',
  'yamato': 'ヤマト',
  'kouzuki oden': '光月おでん',
  'kozuki oden': '光月おでん',
  'oden': '光月おでん',
  'jewelry bonney': 'ジュエリー・ボニー',
  'bonney': 'ジュエリー・ボニー',
  'rob lucci': 'ロブ・ルッチ',
  'lucci': 'ロブ・ルッチ',
  'sakazuki': 'サカズキ',
  'akainu': 'サカズキ',
  'kuzan': 'クザン',
  'aokiji': 'クザン',
  'borsalino': 'ボルサリーノ',
  'kizaru': 'ボルサリーノ',
  'issho': 'イッショウ',
  'fujitora': 'イッショウ',
  'aramaki': 'アラマキ',
  'ryokugyu': 'アラマキ',
  'smoker': 'スモーカー',
  'monkey.d.garp': 'モンキー・D・ガープ',
  'monkey d. garp': 'モンキー・D・ガープ',
  'garp': 'モンキー・D・ガープ',
  'sengoku': 'センゴク',
  'charlotte linlin': 'シャーロット・リンリン',
  'big mom': 'シャーロット・リンリン',
  'charlotte katakuri': 'シャーロット・カタクリ',
  'katakuri': 'シャーロット・カタクリ',
  'kaido': 'カイドウ',
  'king': 'キング',
  'queen': 'クイーン',
  'jack': 'ジャック',
  'uta': 'ウタ',
  'silvers rayleigh': 'シルバーズ・レイリー',
  'rayleigh': 'シルバーズ・レイリー',
  'gol.d.roger': 'ゴール・D・ロジャー',
  'gol d. roger': 'ゴール・D・ロジャー',
  'roger': 'ゴール・D・ロジャー',
  'monkey.d.dragon': 'モンキー・D・ドラゴン',
  'monkey d. dragon': 'モンキー・D・ドラゴン',
  'dragon': 'モンキー・D・ドラゴン',
  'nefeltari vivi': 'ネフェルタリ・ビビ',
  'vivi': 'ネフェルタリ・ビビ',
  'rebecca': 'レベッカ',
  'shirahoshi': 'しらほし',
  'perona': 'ペローナ',
  'carrot': 'キャロット',
  'vinsmoke reiju': 'ヴィンスモーク・レイジュ',
  'reiju': 'ヴィンスモーク・レイジュ',
  'loki': 'ロキ',
  'saint gunko': '軍子聖',
  'saint shamrock': 'シャムロック聖',
  'saint figarland garling': 'フィーガーランド・ガーリング聖',
  'saint topman warcury': 'トップマン・ウォーキュリー聖',
  'saint marcus mars': 'マーカス・マーズ聖',
  'saint ethanbaron v. nusjuro': 'イーザンバロン・V・ナス寿郎聖',
  'saint jaygarcia saturn': 'ジェイガルシア・サターン聖',
  'saint shepherd ju peter': 'シェパード・十・ピーター聖'
};

const cardsMap = new Map();
const variantsList = [];

// Helper to determine variant label from id / image
function getVariantLabel(id, rarity, setName) {
  const lowId = id.toLowerCase();
  const lowSet = (setName || '').toLowerCase();
  
  if (lowId.includes('_p1') || lowId.includes('_p2') || lowId.includes('_p3') || lowId.includes('_p4')) {
    if (lowId.includes('manga') || lowSet.includes('manga') || rarity === 'MANGA') return 'Manga Comic Parallel';
    if (rarity === 'SP CARD' || rarity === 'SP' || lowSet.includes('sp')) return 'Special Card (SP)';
    if (lowSet.includes('winner') || lowId.includes('winner')) return 'Winner Promo';
    if (lowSet.includes('judge') || lowId.includes('judge')) return 'Judge Exclusive';
    if (lowSet.includes('anniversary') || lowId.includes('anniv')) return 'Anniversary Parallel';
    if (lowSet.includes('prb') || lowSet.includes('best')) return 'Premium Booster Reprint';
    return 'Alternate Art Parallel';
  }
  if (rarity === 'SP CARD' || rarity === 'SP') return 'Special Card (SP)';
  if (rarity === 'SEC') return 'Secret Rare (SEC)';
  if (rarity === 'SR') return 'Super Rare (SR)';
  if (rarity === 'L') return 'Leader Regular';
  if (rarity === 'P') return 'Promo Edition';
  return 'Regular';
}

// 1. Process all 4,844 entries from raw database
for (const item of rawDb) {
  if (!item || !item.id) continue;
  
  // Extract base code: e.g. EB01-009_p1 -> EB01-009, OP01-001 -> OP01-001, P-001 -> P-001
  const cleanId = item.id.trim();
  const baseCode = cleanId.split('_')[0].split('-r')[0].toUpperCase();
  
  // Normalization
  let category = 'Character';
  const tUpper = (item.type || '').toUpperCase();
  if (tUpper.includes('LEADER')) category = 'Leader';
  else if (tUpper.includes('EVENT')) category = 'Event';
  else if (tUpper.includes('STAGE')) category = 'Stage';
  else if (tUpper.includes('CHARACTER')) category = 'Character';

  let cost = null;
  if (item.cost && item.cost !== '-' && !isNaN(parseInt(item.cost))) {
    cost = parseInt(item.cost, 10);
  }

  let power = null;
  if (item.power && item.power !== '-' && !isNaN(parseInt(item.power))) {
    power = parseInt(item.power, 10);
  }

  let counter = 0;
  if (item.counter && item.counter !== '-' && !isNaN(parseInt(item.counter))) {
    counter = parseInt(item.counter, 10);
  }

  const setCodeMatch = baseCode.match(/^([A-Z0-9]+)-/);
  const setCode = setCodeMatch ? setCodeMatch[1] : (cleanId.split('-')[0] || 'OP');

  const imgFilename = cleanId.endsWith('.png') ? cleanId : cleanId + '.png';
  const defaultImg = baseCode + '.png';

  // Variant entry for variants.json
  const vLabel = getVariantLabel(cleanId, item.rarity, item.set);
  variantsList.push({
    card_code: baseCode,
    variant_label: vLabel,
    image_path: imgFilename,
    market_price: vLabel.includes('Manga') ? 450.00 : (vLabel.includes('Special') ? 45.00 : (vLabel.includes('Parallel') ? 25.00 : (rarityPrice(item.rarity)))),
    low_price: 0.25,
    updated_at: new Date().toISOString()
  });

  // Base card entry
  if (!cardsMap.has(baseCode)) {
    // Find Japanese name
    let jpName = undefined;
    const nameLow = (item.name || '').toLowerCase().trim();
    for (const [key, jp] of Object.entries(JP_CHAR_MAP)) {
      if (nameLow === key || nameLow.includes(key)) {
        jpName = jp;
        break;
      }
    }

    // Check if existing card had custom translations
    const existing = existingByCode.get(baseCode);
    if (existing) {
      if (existing.jp_name) jpName = existing.jp_name;
    }

    cardsMap.set(baseCode, {
      id: cleanId,
      card_code: baseCode,
      set_code: setCode,
      name: item.name,
      jp_name: jpName,
      category: category,
      rarity: item.rarity || 'C',
      color: Array.isArray(item.color) ? item.color : [item.color || 'Red'],
      cost: cost,
      power: power,
      counter: counter,
      type: Array.isArray(item.types) ? item.types.filter(Boolean) : [],
      attribute: item.attribute || '',
      trigger: item.trigger || '',
      effect: item.effect || '',
      effect_fr: existing ? existing.effect_fr : undefined,
      is_japanese: existing ? existing.is_japanese : false,
      _imagePaths: [imgFilename],
      _defaultImagePath: defaultImg
    });
  } else {
    const card = cardsMap.get(baseCode);
    if (!card._imagePaths.includes(imgFilename)) {
      card._imagePaths.push(imgFilename);
    }
  }
}

function rarityPrice(r) {
  if (r === 'SEC') return 25.00;
  if (r === 'SR') return 4.50;
  if (r === 'R') return 1.20;
  if (r === 'L') return 8.00;
  if (r === 'SP CARD' || r === 'SP') return 45.00;
  return 0.35;
}

// 2. Also preserve any extra Japanese / Reveal cards that might not be in official Bandai EN site yet (e.g. OP18, EB05, PRB02 unreleased)
for (const [code, existing] of existingByCode) {
  if (!cardsMap.has(code)) {
    cardsMap.set(code, existing);
    variantsList.push({
      card_code: code,
      variant_label: 'Japanese Exclusive / Reveal',
      image_path: existing._defaultImagePath || code + '.png',
      market_price: 15.00,
      low_price: 0.50,
      updated_at: new Date().toISOString()
    });
  }
}

const finalCards = Array.from(cardsMap.values());

console.log('Final unique cards count:', finalCards.length);
console.log('Total variants count:', variantsList.length);

fs.writeFileSync(cardsPath, JSON.stringify(finalCards, null, 2), 'utf8');
fs.writeFileSync(variantsPath, JSON.stringify(variantsList, null, 2), 'utf8');
console.log('Successfully saved cards.json and variants.json!');
