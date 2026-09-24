/*
# Restrict CueLegends write access to administrators

Only users listed in public.admin_users may INSERT, UPDATE, or DELETE
platform data. Public visitors remain read-only.
*/

-- ============================================================
-- ADMIN USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- The admin list itself is not publicly readable.
DROP POLICY IF EXISTS "admin_users_select_self" ON public.admin_users;

CREATE POLICY "admin_users_select_self"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================================
-- ADMIN CHECK FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- ============================================================
-- REGISTER THE EXISTING CUELEGENDS ADMIN
-- ============================================================

INSERT INTO public.admin_users (user_id)
VALUES ('1f990da2-f861-4778-b331-51c5c3163efe')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- RESTRICT WRITE POLICIES
-- ============================================================

-- COUNTRIES
DROP POLICY IF EXISTS "admin_insert_countries" ON public.countries;
CREATE POLICY "admin_insert_countries"
ON public.countries FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_countries" ON public.countries;
CREATE POLICY "admin_update_countries"
ON public.countries FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_countries" ON public.countries;
CREATE POLICY "admin_delete_countries"
ON public.countries FOR DELETE TO authenticated
USING (public.is_admin());

-- POOL DISCIPLINES
DROP POLICY IF EXISTS "admin_insert_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_insert_disciplines"
ON public.pool_disciplines FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_update_disciplines"
ON public.pool_disciplines FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_disciplines" ON public.pool_disciplines;
CREATE POLICY "admin_delete_disciplines"
ON public.pool_disciplines FOR DELETE TO authenticated
USING (public.is_admin());

-- CLUBS
DROP POLICY IF EXISTS "admin_insert_clubs" ON public.clubs;
CREATE POLICY "admin_insert_clubs"
ON public.clubs FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_clubs" ON public.clubs;
CREATE POLICY "admin_update_clubs"
ON public.clubs FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_clubs" ON public.clubs;
CREATE POLICY "admin_delete_clubs"
ON public.clubs FOR DELETE TO authenticated
USING (public.is_admin());

-- PLAYERS
DROP POLICY IF EXISTS "admin_insert_players" ON public.players;
CREATE POLICY "admin_insert_players"
ON public.players FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_players" ON public.players;
CREATE POLICY "admin_update_players"
ON public.players FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_players" ON public.players;
CREATE POLICY "admin_delete_players"
ON public.players FOR DELETE TO authenticated
USING (public.is_admin());

-- CLUB PLAYERS
DROP POLICY IF EXISTS "admin_insert_club_players" ON public.club_players;
CREATE POLICY "admin_insert_club_players"
ON public.club_players FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_club_players" ON public.club_players;
CREATE POLICY "admin_update_club_players"
ON public.club_players FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_club_players" ON public.club_players;
CREATE POLICY "admin_delete_club_players"
ON public.club_players FOR DELETE TO authenticated
USING (public.is_admin());

-- CLUB DISCIPLINES
DROP POLICY IF EXISTS "admin_insert_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_insert_club_disciplines"
ON public.club_disciplines FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_update_club_disciplines"
ON public.club_disciplines FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_club_disciplines" ON public.club_disciplines;
CREATE POLICY "admin_delete_club_disciplines"
ON public.club_disciplines FOR DELETE TO authenticated
USING (public.is_admin());

-- FIXTURES
DROP POLICY IF EXISTS "admin_insert_fixtures" ON public.fixtures;
CREATE POLICY "admin_insert_fixtures"
ON public.fixtures FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_fixtures" ON public.fixtures;
CREATE POLICY "admin_update_fixtures"
ON public.fixtures FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_fixtures" ON public.fixtures;
CREATE POLICY "admin_delete_fixtures"
ON public.fixtures FOR DELETE TO authenticated
USING (public.is_admin());

-- MATCHES
DROP POLICY IF EXISTS "admin_insert_matches" ON public.matches;
CREATE POLICY "admin_insert_matches"
ON public.matches FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_matches" ON public.matches;
CREATE POLICY "admin_update_matches"
ON public.matches FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_matches" ON public.matches;
CREATE POLICY "admin_delete_matches"
ON public.matches FOR DELETE TO authenticated
USING (public.is_admin());

-- RANKINGS
DROP POLICY IF EXISTS "admin_insert_rankings" ON public.rankings;
CREATE POLICY "admin_insert_rankings"
ON public.rankings FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_rankings" ON public.rankings;
CREATE POLICY "admin_update_rankings"
ON public.rankings FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_rankings" ON public.rankings;
CREATE POLICY "admin_delete_rankings"
ON public.rankings FOR DELETE TO authenticated
USING (public.is_admin());