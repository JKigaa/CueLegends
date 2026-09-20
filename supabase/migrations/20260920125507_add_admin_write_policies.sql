/*
# Add Admin Write Policies for CueLeague

## Overview
This migration adds INSERT, UPDATE, and DELETE policies for authenticated users on all
existing CueLeague tables. The public read policies remain unchanged — the public site
keeps working as before. Authenticated admins (via Supabase email/password login) gain
full CRUD access to manage the platform's data.

## Tables Modified
- countries
- pool_disciplines
- clubs
- players
- club_players
- club_disciplines
- fixtures
- matches
- rankings

## Security Changes
- Public SELECT policies (already present) remain as-is: anon + authenticated can read.
- New INSERT / UPDATE / DELETE policies added TO authenticated on every table.
- No ownership columns — this is an admin platform where any authenticated user manages
  all data. The admin account is controlled by the platform operator.

## Important Notes
1. This migration does NOT alter table structures or drop any data.
2. Policies are idempotent: each drops the policy first if it exists, then creates it.
3. RLS remains enabled on all tables.
*/

-- ===== COUNTRIES =====
DROP POLICY IF EXISTS "admin_insert_countries" ON public.countries;
CREATE POLICY "admin_insert_countries" ON public.countries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_countries" ON public.countries;
CREATE POLICY "admin_update_countries" ON public.countries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_countries" ON public.countries;
CREATE POLICY "admin_delete_countries" ON public.countries FOR DELETE TO authenticated USING (true);

-- ===== POOL_DISCIPLINES =====
DROP POLICY IF EXISTS "admin_insert_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_insert_disciplines" ON public.pool_disciplines FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_update_disciplines" ON public.pool_disciplines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_delete_disciplines" ON public.pool_disciplines FOR DELETE TO authenticated USING (true);

-- ===== CLUBS =====
DROP POLICY IF EXISTS "admin_insert_clubs" ON public.clubs;
CREATE POLICY "admin_insert_clubs" ON public.clubs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_clubs" ON public.clubs;
CREATE POLICY "admin_update_clubs" ON public.clubs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_clubs" ON public.clubs;
CREATE POLICY "admin_delete_clubs" ON public.clubs FOR DELETE TO authenticated USING (true);

-- ===== PLAYERS =====
DROP POLICY IF EXISTS "admin_insert_players" ON public.players;
CREATE POLICY "admin_insert_players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_players" ON public.players;
CREATE POLICY "admin_update_players" ON public.players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_players" ON public.players;
CREATE POLICY "admin_delete_players" ON public.players FOR DELETE TO authenticated USING (true);

-- ===== CLUB_PLAYERS =====
DROP POLICY IF EXISTS "admin_insert_club_players" ON public.club_players;
CREATE POLICY "admin_insert_club_players" ON public.club_players FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_club_players" ON public.club_players;
CREATE POLICY "admin_update_club_players" ON public.club_players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_club_players" ON public.club_players;
CREATE POLICY "admin_delete_club_players" ON public.club_players FOR DELETE TO authenticated USING (true);

-- ===== CLUB_DISCIPLINES =====
DROP POLICY IF EXISTS "admin_insert_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_insert_club_disciplines" ON public.club_disciplines FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_update_club_disciplines" ON public.club_disciplines FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_delete_club_disciplines" ON public.club_disciplines FOR DELETE TO authenticated USING (true);

-- ===== FIXTURES =====
DROP POLICY IF EXISTS "admin_insert_fixtures" ON public.fixtures;
CREATE POLICY "admin_insert_fixtures" ON public.fixtures FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_fixtures" ON public.fixtures;
CREATE POLICY "admin_update_fixtures" ON public.fixtures FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_fixtures" ON public.fixtures;
CREATE POLICY "admin_delete_fixtures" ON public.fixtures FOR DELETE TO authenticated USING (true);

-- ===== MATCHES =====
DROP POLICY IF EXISTS "admin_insert_matches" ON public.matches;
CREATE POLICY "admin_insert_matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_matches" ON public.matches;
CREATE POLICY "admin_update_matches" ON public.matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_matches" ON public.matches;
CREATE POLICY "admin_delete_matches" ON public.matches FOR DELETE TO authenticated USING (true);

-- ===== RANKINGS =====
DROP POLICY IF EXISTS "admin_insert_rankings" ON public.rankings;
CREATE POLICY "admin_insert_rankings" ON public.rankings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_rankings" ON public.rankings;
CREATE POLICY "admin_update_rankings" ON public.rankings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_rankings" ON public.rankings;
CREATE POLICY "admin_delete_rankings" ON public.rankings FOR DELETE TO authenticated USING (true);