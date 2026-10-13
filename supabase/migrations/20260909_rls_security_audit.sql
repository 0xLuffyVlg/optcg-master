-- =============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) AUDIT & ENFORCEMENT SCRIPT
-- Project: OPTCG Master (https://www.optcg-master.fr)
-- Date: 2026-09-09
-- Purpose: Strict user data isolation (Zero Cross-User Data Leaks) + Public Read Protection
-- =============================================================================

-- =============================================================================
-- 1. TABLE: profiles
-- Stores user identity, display pseudo, avatar selection.
-- Privacy: Strictly isolated per user. No user can view or alter another user's profile.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pseudo TEXT,
    avatar_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable & Force RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 1.1 SELECT: Only the owner can read their profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 1.2 INSERT: Only the authenticated user can create their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 1.3 UPDATE: Only the owner can update their profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 1.4 DELETE: Only the owner can delete their profile
CREATE POLICY "profiles_delete_own"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);


-- =============================================================================
-- 2. TABLE: user_collections
-- Stores card binder counts, owned cards, foil quantities.
-- Privacy: Strictly private. Cannot be read, updated, inserted, or deleted by any other user.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    collection_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable & Force RLS
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections FORCE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "user_collections_select_own" ON public.user_collections;
DROP POLICY IF EXISTS "user_collections_insert_own" ON public.user_collections;
DROP POLICY IF EXISTS "user_collections_update_own" ON public.user_collections;
DROP POLICY IF EXISTS "user_collections_delete_own" ON public.user_collections;

-- 2.1 SELECT: Only the owner can read their collection
CREATE POLICY "user_collections_select_own"
ON public.user_collections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2.2 INSERT: Only the authenticated user can insert collection with their user_id
CREATE POLICY "user_collections_insert_own"
ON public.user_collections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2.3 UPDATE: Only the owner can update their collection
CREATE POLICY "user_collections_update_own"
ON public.user_collections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2.4 DELETE: Only the owner can delete their collection
CREATE POLICY "user_collections_delete_own"
ON public.user_collections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =============================================================================
-- 3. TABLE: user_favorites
-- Stores favorite card codes per user.
-- Privacy: Strictly private. Zero cross-user visibility or write access.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    favorites_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable & Force RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites FORCE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "user_favorites_select_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_insert_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_update_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_delete_own" ON public.user_favorites;

-- 3.1 SELECT: Only the owner can read their favorites
CREATE POLICY "user_favorites_select_own"
ON public.user_favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3.2 INSERT: Only the authenticated user can insert favorites with their user_id
CREATE POLICY "user_favorites_insert_own"
ON public.user_favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3.3 UPDATE: Only the owner can update their favorites
CREATE POLICY "user_favorites_update_own"
ON public.user_favorites
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.4 DELETE: Only the owner can delete their favorites
CREATE POLICY "user_favorites_delete_own"
ON public.user_favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =============================================================================
-- 4. TABLE: user_sealed (Optional / Future Cloud Sync for Sealed Portfolio)
-- Stores sealed boxes, displays, decks per user.
-- Privacy: Strictly private.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_sealed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    sealed_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable & Force RLS
ALTER TABLE public.user_sealed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sealed FORCE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "user_sealed_select_own" ON public.user_sealed;
DROP POLICY IF EXISTS "user_sealed_insert_own" ON public.user_sealed;
DROP POLICY IF EXISTS "user_sealed_update_own" ON public.user_sealed;
DROP POLICY IF EXISTS "user_sealed_delete_own" ON public.user_sealed;

CREATE POLICY "user_sealed_select_own"
ON public.user_sealed
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_sealed_insert_own"
ON public.user_sealed
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sealed_update_own"
ON public.user_sealed
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sealed_delete_own"
ON public.user_sealed
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =============================================================================
-- 5. TABLE: card_prices (Public Reference Data)
-- Stores Cardmarket / TCGPlayer synced market prices.
-- Access: Read-only for all users (anon & authenticated). Writes locked to service_role.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.card_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_code TEXT NOT NULL UNIQUE,
    price_avg NUMERIC,
    price_low NUMERIC,
    price_trend NUMERIC,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.card_prices ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "card_prices_read_all" ON public.card_prices;

-- 5.1 SELECT: Publicly readable by anyone (anon & authenticated)
CREATE POLICY "card_prices_read_all"
ON public.card_prices
FOR SELECT
TO public
USING (true);


-- =============================================================================
-- 6. TABLE: live_tournaments (Public Meta Reference Data)
-- Stores decklists and tournament results.
-- Access: Read-only for all users (anon & authenticated). Writes locked to service_role.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.live_tournaments (
    id TEXT PRIMARY KEY,
    tournament_name TEXT,
    set_group TEXT,
    country TEXT,
    host TEXT,
    start_date TEXT,
    placement_str TEXT,
    deck_type TEXT,
    player_name TEXT,
    score TEXT,
    tournament_results JSONB,
    tournaments_data JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_tournaments ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "live_tournaments_read_all" ON public.live_tournaments;

-- 6.1 SELECT: Publicly readable by anyone (anon & authenticated)
CREATE POLICY "live_tournaments_read_all"
ON public.live_tournaments
FOR SELECT
TO public
USING (true);
