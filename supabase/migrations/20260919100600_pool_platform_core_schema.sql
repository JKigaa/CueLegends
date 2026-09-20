/*
# Pool Sports Platform — Core Schema

## Overview
Creates the foundational database schema for a global pool/billiards sports platform.
This is phase one: the public discovery layer (clubs, players, fixtures, results, rankings).

## New Tables
1. `countries` — ISO countries for global scope
2. `pool_disciplines` — supported pool game types (8-Ball, 9-Ball, etc.)
3. `clubs` — pool clubs with country, city, venue, stats
4. `players` — individual player profiles linked to clubs and countries
5. `club_players` — junction table for club membership history
6. `club_disciplines` — which disciplines a club plays
7. `fixtures` — club vs club or player vs player scheduled matches
8. `matches` — individual player vs player matches within a fixture
9. `rankings` — player ranking points by discipline and scope

## Security
- RLS enabled on all tables
- Public read access (anon + authenticated) — this is a public sports platform
- No write policies yet (admin/management features come in a later phase)
*/

-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  iso_code text NOT NULL UNIQUE,
  flag_emoji text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_countries" ON public.countries;
CREATE POLICY "public_read_countries" ON public.countries FOR SELECT TO anon, authenticated USING (true);

-- Pool Disciplines
CREATE TABLE IF NOT EXISTS public.pool_disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon_emoji text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pool_disciplines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_disciplines" ON public.pool_disciplines;
CREATE POLICY "public_read_disciplines" ON public.pool_disciplines FOR SELECT TO anon, authenticated USING (true);

-- Clubs
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_name text,
  logo_url text,
  cover_url text,
  country_id uuid REFERENCES public.countries(id),
  region text,
  city text,
  venue_name text,
  venue_address text,
  founded_year int,
  description text,
  primary_discipline_id uuid REFERENCES public.pool_disciplines(id),
  total_matches int DEFAULT 0,
  total_wins int DEFAULT 0,
  total_losses int DEFAULT 0,
  total_draws int DEFAULT 0,
  total_frames_won int DEFAULT 0,
  total_frames_lost int DEFAULT 0,
  trophies int DEFAULT 0,
  ranking_points int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_clubs" ON public.clubs;
CREATE POLICY "public_read_clubs" ON public.clubs FOR SELECT TO anon, authenticated USING (true);

-- Players
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  photo_url text,
  cover_url text,
  country_id uuid REFERENCES public.countries(id),
  region text,
  city text,
  current_club_id uuid REFERENCES public.clubs(id),
  bio text,
  primary_discipline_id uuid REFERENCES public.pool_disciplines(id),
  secondary_disciplines text[],
  total_matches int DEFAULT 0,
  total_wins int DEFAULT 0,
  total_losses int DEFAULT 0,
  total_frames_won int DEFAULT 0,
  total_frames_lost int DEFAULT 0,
  titles int DEFAULT 0,
  finals int DEFAULT 0,
  ranking_points int DEFAULT 0,
  rating numeric(4,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_players" ON public.players;
CREATE POLICY "public_read_players" ON public.players FOR SELECT TO anon, authenticated USING (true);

-- Club Players (membership history)
CREATE TABLE IF NOT EXISTS public.club_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  joined_date date,
  left_date date,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(club_id, player_id, is_current)
);

ALTER TABLE public.club_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_club_players" ON public.club_players;
CREATE POLICY "public_read_club_players" ON public.club_players FOR SELECT TO anon, authenticated USING (true);

-- Club Disciplines
CREATE TABLE IF NOT EXISTS public.club_disciplines (
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  discipline_id uuid NOT NULL REFERENCES public.pool_disciplines(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, discipline_id)
);

ALTER TABLE public.club_disciplines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_club_disciplines" ON public.club_disciplines;
CREATE POLICY "public_read_club_disciplines" ON public.club_disciplines FOR SELECT TO anon, authenticated USING (true);

-- Fixtures
CREATE TABLE IF NOT EXISTS public.fixtures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_number text UNIQUE,
  fixture_type text NOT NULL DEFAULT 'club',
  home_club_id uuid REFERENCES public.clubs(id),
  away_club_id uuid REFERENCES public.clubs(id),
  home_player_id uuid REFERENCES public.players(id),
  away_player_id uuid REFERENCES public.players(id),
  discipline_id uuid REFERENCES public.pool_disciplines(id),
  competition_name text,
  round text,
  venue_name text,
  venue_city text,
  match_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  home_score int DEFAULT 0,
  away_score int DEFAULT 0,
  best_of_frames int DEFAULT 7,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_fixtures" ON public.fixtures;
CREATE POLICY "public_read_fixtures" ON public.fixtures FOR SELECT TO anon, authenticated USING (true);

-- Individual Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id uuid NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  match_number int NOT NULL,
  home_player_id uuid REFERENCES public.players(id),
  away_player_id uuid REFERENCES public.players(id),
  home_score int DEFAULT 0,
  away_score int DEFAULT 0,
  frames_played int DEFAULT 0,
  winner_id uuid REFERENCES public.players(id),
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_matches" ON public.matches;
CREATE POLICY "public_read_matches" ON public.matches FOR SELECT TO anon, authenticated USING (true);

-- Rankings
CREATE TABLE IF NOT EXISTS public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  discipline_id uuid REFERENCES public.pool_disciplines(id),
  scope text NOT NULL DEFAULT 'global',
  country_id uuid REFERENCES public.countries(id),
  rank_position int,
  points int DEFAULT 0,
  period text DEFAULT 'all_time',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_rankings" ON public.rankings;
CREATE POLICY "public_read_rankings" ON public.rankings FOR SELECT TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clubs_country ON public.clubs(country_id);
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON public.clubs(slug);
CREATE INDEX IF NOT EXISTS idx_players_slug ON public.players(slug);
CREATE INDEX IF NOT EXISTS idx_players_country ON public.players(country_id);
CREATE INDEX IF NOT EXISTS idx_players_current_club ON public.players(current_club_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON public.fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON public.fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_home_club ON public.fixtures(home_club_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_away_club ON public.fixtures(away_club_id);
CREATE INDEX IF NOT EXISTS idx_matches_fixture ON public.matches(fixture_id);
CREATE INDEX IF NOT EXISTS idx_club_players_club ON public.club_players(club_id);
CREATE INDEX IF NOT EXISTS idx_club_players_player ON public.club_players(player_id);
CREATE INDEX IF NOT EXISTS idx_rankings_player ON public.rankings(player_id);
CREATE INDEX IF NOT EXISTS idx_rankings_discipline ON public.rankings(discipline_id);