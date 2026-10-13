-- =============================================================================
-- SUPABASE MIGRATION: One Piece Card Game Master Catalog, Sets & Card Details
-- Date: 2026-09-30
-- Compatible with onepiece-database (17,330 cards FR, EN, JP & 2,710 detailed cards)
-- =============================================================================

-- 1. Table sets
CREATE TABLE IF NOT EXISTS public.sets (
  set_slug TEXT NOT NULL,
  set_name TEXT NOT NULL,
  language TEXT NOT NULL,
  card_count INTEGER,
  PRIMARY KEY (set_slug, language)
);

-- 2. Table cards (17,330 fiches & variantes JP, EN, FR avec cotes et images WebP)
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_jp TEXT,
  language TEXT NOT NULL,
  set_slug TEXT NOT NULL,
  set_name TEXT NOT NULL,
  pos INTEGER,
  category TEXT,
  rarity TEXT,
  color TEXT,
  art_type TEXT,
  variant INTEGER,
  block INTEGER,
  image_path TEXT,
  image_url TEXT,
  price_eur NUMERIC,
  price_min_eur NUMERIC,
  price_avg7_eur NUMERIC,
  price_avg30_eur NUMERIC,
  listings_count INTEGER,
  cost INTEGER,
  power INTEGER,
  counter INTEGER,
  effect TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table card_details (2,710 fiches de détails de jeu complètes carte par carte)
CREATE TABLE IF NOT EXISTS public.card_details (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  cost INTEGER,
  power INTEGER,
  counter INTEGER,
  life INTEGER,
  attribute TEXT,
  types TEXT,
  effect TEXT,
  trigger TEXT,
  illust TEXT,
  color TEXT,
  rarity TEXT,
  block INTEGER,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes optimisés pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_cards_code ON public.cards(code);
CREATE INDEX IF NOT EXISTS idx_cards_lang ON public.cards(language);
CREATE INDEX IF NOT EXISTS idx_cards_set ON public.cards(set_slug);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON public.cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_category ON public.cards(category);

CREATE INDEX IF NOT EXISTS idx_details_code ON public.card_details(code);
CREATE INDEX IF NOT EXISTS idx_details_types ON public.card_details(types);
CREATE INDEX IF NOT EXISTS idx_details_category ON public.card_details(category);
CREATE INDEX IF NOT EXISTS idx_details_color ON public.card_details(color);

-- 5. Row Level Security (RLS) - Lecture publique illimitée pour tous les visiteurs
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sets_read_all" ON public.sets;
CREATE POLICY "sets_read_all" ON public.sets FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "cards_read_all" ON public.cards;
CREATE POLICY "cards_read_all" ON public.cards FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "card_details_read_all" ON public.card_details;
CREATE POLICY "card_details_read_all" ON public.card_details FOR SELECT TO public USING (true);
