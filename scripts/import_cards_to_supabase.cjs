/**
 * Batch import script: Uploads sets, cards, and card_details into Supabase.
 * Usage: node scripts/import_cards_to_supabase.cjs
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hzvczuqamfxqerlalwhj.supabase.co';
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JWVKR9dqEVmtkTGbE-0B8Q_028V8iVT';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const clean = line.replace(/^\uFEFF/, '').trim();
    if (clean.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = clean.replace('VITE_SUPABASE_URL=', '').trim();
    if (clean.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = clean.replace('SUPABASE_SERVICE_ROLE_KEY=', '').trim();
    else if (!process.env.SUPABASE_SERVICE_ROLE_KEY && clean.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = clean.replace('VITE_SUPABASE_ANON_KEY=', '').trim();
    }
  });
}

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function runImport() {
  const cardsPath = path.resolve(__dirname, '../../onepiece-database/data/cards-all.json');
  const setsPath = path.resolve(__dirname, '../../onepiece-database/data/sets.json');
  const detailsPath = path.resolve(__dirname, '../../onepiece-database/data/cards-details.json');

  if (!fs.existsSync(cardsPath)) {
    console.error('cards-all.json not found at:', cardsPath);
    return;
  }

  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  const sets = JSON.parse(fs.readFileSync(setsPath, 'utf8'));
  const detailsObj = fs.existsSync(detailsPath) ? JSON.parse(fs.readFileSync(detailsPath, 'utf8')) : {};
  const details = Object.values(detailsObj);

  console.log(`Loaded ${sets.length} sets, ${cards.length} cards, and ${details.length} detailed cards.`);

  // 1. Import Sets
  console.log('\n--- 1/3 Importing sets into Supabase ---');
  const { error: setsError } = await supabase.from('sets').upsert(sets, { onConflict: 'set_slug,language' });
  if (setsError) {
    console.error('Error importing sets (ensure table public.sets exists):', setsError.message);
  } else {
    console.log('Sets imported successfully!');
  }

  // 2. Import Card Details
  console.log(`\n--- 2/3 Importing ${details.length} card_details into Supabase ---`);
  const detailBatchSize = 500;
  let detailsSuccess = 0;

  for (let i = 0; i < details.length; i += detailBatchSize) {
    const batch = details.slice(i, i + detailBatchSize).map(d => ({
      code: d.code,
      name: d.name,
      category: d.category,
      cost: d.cost !== null && d.cost !== undefined ? Number(d.cost) : null,
      power: d.power !== null && d.power !== undefined ? Number(d.power) : null,
      counter: d.counter !== null && d.counter !== undefined ? Number(d.counter) : null,
      life: d.life !== null && d.life !== undefined ? Number(d.life) : null,
      attribute: d.attribute,
      types: d.types,
      effect: d.effect,
      trigger: d.trigger,
      illust: d.illust,
      color: d.color,
      rarity: d.rarity,
      block: d.block,
      language: d.language
    }));

    const { error: detailError } = await supabase.from('card_details').upsert(batch, { onConflict: 'code' });
    if (detailError) {
      console.error(`Detail Batch ${i / detailBatchSize + 1} error:`, detailError.message);
      if (detailError.code === '42501' || detailError.message.includes('policy')) {
        console.error('NOTE: To insert into card_details from node, provide SUPABASE_SERVICE_ROLE_KEY or run migration in SQL Editor.');
        break;
      }
    } else {
      detailsSuccess += batch.length;
      process.stdout.write(`\rImported ${detailsSuccess}/${details.length} card details...`);
    }
  }
  console.log(`\nCard details finished: ${detailsSuccess} imported.`);

  // 3. Import Cards in batches of 500
  console.log(`\n--- 3/3 Importing ${cards.length} cards into Supabase ---`);
  const batchSize = 500;
  let successCount = 0;

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize).map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      name_jp: c.name_jp,
      language: c.language,
      set_slug: c.set_slug,
      set_name: c.set_name,
      pos: c.pos,
      category: c.category,
      rarity: c.rarity,
      color: c.color,
      art_type: c.art_type,
      variant: c.variant,
      block: c.block,
      image_path: c.image_path,
      image_url: c.image_url,
      price_eur: c.price_eur,
      price_min_eur: c.price_min_eur,
      price_avg7_eur: c.price_avg7_eur,
      price_avg30_eur: c.price_avg30_eur,
      listings_count: c.listings_count
    }));

    const { error: cardError } = await supabase.from('cards').upsert(batch, { onConflict: 'id' });
    if (cardError) {
      console.error(`Batch ${i / batchSize + 1} error:`, cardError.message);
      if (cardError.code === '42501' || cardError.message.includes('policy')) {
        console.error('NOTE: To insert into cards table from node, add SUPABASE_SERVICE_ROLE_KEY to your .env or run the migration script in Supabase SQL Editor.');
        break;
      }
    } else {
      successCount += batch.length;
      process.stdout.write(`\rImported ${successCount}/${cards.length} cards...`);
    }
  }

  console.log(`\n\nAll imports finished! (${detailsSuccess} details, ${successCount} cards)`);
}

runImport().catch(console.error);
