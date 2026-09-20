/*
# Pool Sports Platform — Seed Data

## Overview
Seeds the platform with sample data for the public discovery layer:
- Countries, pool disciplines, clubs, players, club memberships
- Fixtures and individual matches (scheduled, live, completed)
- Rankings by discipline

For the initial launch to demonstrate the platform's features.
*/

-- Countries
INSERT INTO public.countries (name, iso_code, flag_emoji) VALUES
  ('Kenya', 'KE', '🇰🇪'),
  ('Uganda', 'UG', '🇺🇬'),
  ('Tanzania', 'TZ', '🇹🇿'),
  ('Nigeria', 'NG', '🇳🇬'),
  ('South Africa', 'ZA', '🇿🇦'),
  ('United Kingdom', 'GB', '🇬🇧'),
  ('United States', 'US', '🇺🇸')
ON CONFLICT (iso_code) DO NOTHING;

-- Disciplines
INSERT INTO public.pool_disciplines (name, slug, description, icon_emoji, sort_order) VALUES
  ('8-Ball', '8-ball', 'Classic pool game played with 15 balls — solids vs stripes', '8️⃣', 1),
  ('9-Ball', '9-Ball', 'Fast-paced rotation game with 9 balls, must hit lowest first', '9️⃣', 2),
  ('10-Ball', '10-ball', 'Rotation game similar to 9-Ball with an extra ball and call-pocket', '🔟', 3),
  ('Blackball', 'blackball', 'Popular in Africa and UK — reds vs yellows format', '⚫', 4),
  ('Straight Pool', 'straight-pool', 'Continuous scoring pool — first to a target score wins', '🎯', 5)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  ke_id uuid := (SELECT id FROM public.countries WHERE iso_code = 'KE');
  ug_id uuid := (SELECT id FROM public.countries WHERE iso_code = 'UG');
  tz_id uuid := (SELECT id FROM public.countries WHERE iso_code = 'TZ');
  d8 uuid := (SELECT id FROM public.pool_disciplines WHERE slug = '8-ball');
  d9 uuid := (SELECT id FROM public.pool_disciplines WHERE slug = '9-ball');
  db uuid := (SELECT id FROM public.pool_disciplines WHERE slug = 'blackball');
BEGIN
  -- Clubs
  INSERT INTO public.clubs (id, name, slug, short_name, country_id, region, city, venue_name, venue_address, founded_year, description, primary_discipline_id, total_matches, total_wins, total_losses, total_draws, total_frames_won, total_frames_lost, trophies, ranking_points, is_active)
  VALUES
    (gen_random_uuid(), 'Nairobi Sharks', 'nairobi-sharks', 'NBS', ke_id, 'Nairobi', 'Nairobi', 'Sharks Cue Lounge', 'Westlands, Nairobi', 2019, 'The premier pool club in East Africa, home to some of Kenya''s finest cue artists.', d8, 48, 31, 12, 5, 286, 198, 4, 2850, true),
    (gen_random_uuid(), 'Westlands Cue Club', 'westlands-cue-club', 'WCC', ke_id, 'Nairobi', 'Nairobi', 'Cue Masters Hall', 'Westgate Mall, Westlands', 2020, 'A rising force in Nairobi''s pool scene with a focus on Blackball discipline.', db, 42, 24, 14, 4, 240, 210, 2, 2200, true),
    (gen_random_uuid(), 'Mombasa Breakers', 'mombasa-breakers', 'MBR', ke_id, 'Coast', 'Mombasa', 'Coast Cue Arena', 'Nyali, Mombasa', 2018, 'Coastal pool powerhouse known for aggressive break shots and 9-Ball expertise.', d9, 39, 22, 15, 2, 198, 175, 3, 1950, true),
    (gen_random_uuid(), 'Kampala Cuesticks', 'kampala-cuesticks', 'KCS', ug_id, 'Central', 'Kampala', 'Cue Sports Uganda', 'Kampala Road, Kampala', 2021, 'Uganda''s leading pool club, bringing East African pool talent to the continental stage.', d8, 35, 18, 14, 3, 165, 158, 1, 1650, true),
    (gen_random_uuid(), 'Dar es Salaam Pockets', 'dar-pockets', 'DTP', tz_id, 'Dar es Salaam', 'Dar es Salaam', 'TZ Cue Centre', 'Kariakoo, Dar es Salaam', 2022, 'Tanzania''s fastest-growing pool club, competing in East African regional challenges.', db, 28, 15, 11, 2, 132, 128, 0, 1400, true),
    (gen_random_uuid(), 'Kasarani Aces', 'kasarani-aces', 'KSA', ke_id, 'Nairobi', 'Nairobi', 'Aces Pool Hall', 'Kasarani, Nairobi', 2023, 'A new generation pool club from Kasarani making waves in the Nairobi league.', d9, 22, 13, 8, 1, 98, 82, 0, 1200, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Club disciplines
  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'nairobi-sharks' AND d.slug IN ('8-ball', '9-ball', 'blackball')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'westlands-cue-club' AND d.slug IN ('blackball', '8-ball')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'mombasa-breakers' AND d.slug IN ('9-ball', '10-ball')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'kampala-cuesticks' AND d.slug IN ('8-ball', 'blackball')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'dar-pockets' AND d.slug IN ('blackball')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.club_disciplines (club_id, discipline_id)
  SELECT c.id, d.id FROM public.clubs c CROSS JOIN public.pool_disciplines d
  WHERE c.slug = 'kasarani-aces' AND d.slug IN ('9-ball', '8-ball')
  ON CONFLICT DO NOTHING;

  -- Players
  INSERT INTO public.players (id, name, slug, country_id, region, city, current_club_id, bio, primary_discipline_id, secondary_disciplines, total_matches, total_wins, total_losses, total_frames_won, total_frames_lost, titles, finals, ranking_points, rating, is_active)
  SELECT gen_random_uuid(), v.name, v.slug, ke_id, v.region, v.city,
    (SELECT id FROM public.clubs WHERE slug = v.club_slug),
    v.bio, v.discipline_id, v.secondary,
    v.tm, v.tw, v.tl, v.fw, v.fl, v.titles, v.finals, v.rp, v.rating, true
  FROM (VALUES
    ('Brian Otieno', 'brian-otieno', 'Nairobi', 'Nairobi', 'nairobi-sharks', 'Kenya''s #1 ranked 8-Ball player and national team captain.', d8, ARRAY['9-ball','blackball'], 52, 38, 12, 410, 295, 5, 3, 3200, 4.85),
    ('James Mwangi', 'james-mwangi', 'Nairobi', 'Nairobi', 'nairobi-sharks', 'Precision shooter known for flawless safeties and break control.', d8, ARRAY['blackball'], 46, 30, 14, 355, 280, 3, 2, 2750, 4.65),
    ('Peter Kamau', 'peter-kamau', 'Nairobi', 'Nairobi', 'nairobi-sharks', 'Rising star in the Nairobi pool circuit with a deadly 9-Ball break.', d9, ARRAY['8-ball'], 38, 24, 12, 298, 260, 2, 1, 2400, 4.45),
    ('David Njoroge', 'david-njoroge', 'Nairobi', 'Nairobi', 'nairobi-sharks', 'Veteran cueist with 15 years of competitive pool experience.', d8, ARRAY['straight-pool'], 41, 25, 15, 320, 290, 2, 4, 2300, 4.35),
    ('Samuel Kariuki', 'samuel-kariuki', 'Nairobi', 'Nairobi', 'nairobi-sharks', 'All-round talent excelling in both 8-Ball and Blackball formats.', db, ARRAY['8-ball'], 35, 22, 12, 280, 245, 1, 2, 2100, 4.25),
    ('Grace Wanjiru', 'grace-wanjiru', 'Nairobi', 'Nairobi', 'westlands-cue-club', 'Top-ranked female player in East Africa and Blackball specialist.', db, ARRAY['8-ball'], 44, 28, 14, 320, 270, 4, 2, 2600, 4.70),
    ('Mercy Achieng', 'mercy-achieng', 'Nairobi', 'Nairobi', 'westlands-cue-club', 'Known for clutch break-building and a fierce competitive spirit.', db, ARRAY['9-ball'], 38, 22, 15, 260, 240, 2, 1, 2050, 4.30),
    ('Kevin Omondi', 'kevin-omondi', 'Nairobi', 'Nairobi', 'westlands-cue-club', 'Blackball circuit regular with multiple regional titles.', db, ARRAY['8-ball'], 40, 24, 14, 295, 265, 3, 2, 2350, 4.50),
    ('Ali Hassan', 'ali-hassan', 'Coast', 'Mombasa', 'mombasa-breakers', 'Coast region champion with a reputation for powerful 9-Ball breaks.', d9, ARRAY['10-ball'], 42, 26, 15, 310, 280, 3, 2, 2500, 4.55),
    ('Fatuma Said', 'fatuma-said', 'Coast', 'Mombasa', 'mombasa-breakers', 'Pioneer of women''s pool on the Kenyan coast and a 10-Ball specialist.', d9, ARRAY['9-ball'], 33, 19, 13, 220, 210, 2, 1, 1900, 4.15),
    ('John Mwesigwa', 'john-mwesigwa', 'Central', 'Kampala', 'kampala-cuesticks', 'Uganda''s national pool champion and East African contender.', d8, ARRAY['blackball'], 40, 24, 14, 310, 275, 3, 2, 2400, 4.50),
    ('Patrick Okello', 'patrick-okello', 'Central', 'Kampala', 'kampala-cuesticks', 'Consistent performer in regional 8-Ball competitions.', d8, ARRAY['9-ball'], 35, 20, 13, 265, 240, 1, 2, 2000, 4.20),
    ('Joseph Ssebunya', 'joseph-ssebunya', 'Central', 'Kampala', 'kampala-cuesticks', 'Rising Ugandan talent making waves in the Blackball scene.', db, ARRAY['8-ball'], 30, 17, 12, 210, 200, 1, 1, 1750, 4.05),
    ('Issa Mwakyusa', 'issa-mwakyusa', 'Dar es Salaam', 'Dar es Salaam', 'dar-pockets', 'Tanzania''s top-ranked Blackball player and national team regular.', db, ARRAY['8-ball'], 32, 18, 12, 245, 225, 2, 1, 1850, 4.10),
    ('Neema Joseph', 'neema-joseph', 'Dar es Salaam', 'Dar es Salaam', 'dar-pockets', 'Tanzanian pool talent breaking through in regional competitions.', db, ARRAY['straight-pool'], 26, 14, 11, 175, 170, 0, 1, 1500, 3.90),
    ('Cynthia Akoth', 'cynthia-akoth', 'Nairobi', 'Nairobi', 'kasarani-aces', 'Young prodigy and Kasarani Aces standout in the 9-Ball discipline.', d9, ARRAY['8-ball'], 24, 15, 8, 155, 130, 1, 0, 1650, 4.15),
    ('Eric Mutua', 'eric-mutua', 'Nairobi', 'Nairobi', 'kasarani-aces', 'Explosive 9-Ball breaker with a growing reputation in Nairobi.', d9, ARRAY['10-ball'], 22, 13, 8, 140, 115, 0, 1, 1450, 4.00),
    ('Tony Wambua', 'tony-wambua', 'Nairobi', 'Nairobi', 'kasarani-aces', 'All-action player known for come-from-behind wins.', d8, ARRAY['9-ball'], 20, 11, 8, 120, 105, 0, 0, 1300, 3.85)
  ) AS v(name, slug, region, city, club_slug, bio, discipline_id, secondary, tm, tw, tl, fw, fl, titles, finals, rp, rating)
  ON CONFLICT (slug) DO NOTHING;

  -- Club memberships
  INSERT INTO public.club_players (club_id, player_id, joined_date, is_current)
  SELECT c.id, p.id, NULL, true
  FROM public.players p JOIN public.clubs c ON c.id = p.current_club_id
  WHERE NOT EXISTS (SELECT 1 FROM public.club_players cp WHERE cp.club_id = c.id AND cp.player_id = p.id AND cp.is_current = true);

  -- Fixtures
  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-001', 'club', c1.id, c2.id, d8, 'Nairobi Pool League', 'Matchday 5', 'Sharks Cue Lounge', 'Nairobi', NOW() - INTERVAL '3 days', 'completed', 6, 4, 7, true
  FROM (SELECT id FROM public.clubs WHERE slug = 'nairobi-sharks') c1, (SELECT id FROM public.clubs WHERE slug = 'westlands-cue-club') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-001');

  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-002', 'club', c1.id, c2.id, d9, 'Coast Open Challenge', 'Quarter-Final', 'Coast Cue Arena', 'Mombasa', NOW() - INTERVAL '1 day', 'completed', 5, 3, 7, true
  FROM (SELECT id FROM public.clubs WHERE slug = 'mombasa-breakers') c1, (SELECT id FROM public.clubs WHERE slug = 'kasarani-aces') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-002');

  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-003', 'club', c1.id, c2.id, d8, 'East African Club Challenge', 'Semi-Final', 'Sharks Cue Lounge', 'Nairobi', NOW(), 'live', 3, 2, 7, false
  FROM (SELECT id FROM public.clubs WHERE slug = 'nairobi-sharks') c1, (SELECT id FROM public.clubs WHERE slug = 'kampala-cuesticks') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-003');

  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-004', 'club', c1.id, c2.id, db, 'Nairobi Pool League', 'Matchday 6', 'Cue Masters Hall', 'Nairobi', NOW() + INTERVAL '2 days', 'scheduled', 0, 0, 7, false
  FROM (SELECT id FROM public.clubs WHERE slug = 'westlands-cue-club') c1, (SELECT id FROM public.clubs WHERE slug = 'mombasa-breakers') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-004');

  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-005', 'club', c1.id, c2.id, db, 'East African Club Challenge', 'Quarter-Final', 'TZ Cue Centre', 'Dar es Salaam', NOW() + INTERVAL '5 days', 'scheduled', 0, 0, 7, false
  FROM (SELECT id FROM public.clubs WHERE slug = 'dar-pockets') c1, (SELECT id FROM public.clubs WHERE slug = 'kampala-cuesticks') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-005');

  INSERT INTO public.fixtures (fixture_number, fixture_type, home_club_id, away_club_id, discipline_id, competition_name, round, venue_name, venue_city, match_date, status, home_score, away_score, best_of_frames, is_verified)
  SELECT 'FX-2026-006', 'club', c1.id, c2.id, d9, 'Nairobi Pool League', 'Matchday 7', 'Aces Pool Hall', 'Nairobi', NOW() + INTERVAL '7 days', 'scheduled', 0, 0, 7, false
  FROM (SELECT id FROM public.clubs WHERE slug = 'kasarani-aces') c1, (SELECT id FROM public.clubs WHERE slug = 'nairobi-sharks') c2
  WHERE NOT EXISTS (SELECT 1 FROM public.fixtures WHERE fixture_number = 'FX-2026-006');

  -- Matches for completed fixture FX-2026-001
  INSERT INTO public.matches (fixture_id, match_number, home_player_id, away_player_id, home_score, away_score, frames_played, winner_id, status)
  SELECT f.id, v.mn, p1.id, p2.id, v.hs, v.aw, v.hs + v.aw,
    CASE WHEN v.hs > v.aw THEN p1.id WHEN v.aw > v.hs THEN p2.id ELSE NULL END, 'completed'
  FROM public.fixtures f
  CROSS JOIN (VALUES
    (1, 'brian-otieno', 'kevin-omondi', 4, 2),
    (2, 'james-mwangi', 'grace-wanjiru', 4, 3),
    (3, 'peter-kamau', 'mercy-achieng', 2, 4),
    (4, 'david-njoroge', 'kevin-omondi', 4, 1),
    (5, 'samuel-kariuki', 'grace-wanjiru', 4, 3),
    (6, 'brian-otieno', 'mercy-achieng', 4, 2),
    (7, 'james-mwangi', 'kevin-omondi', 3, 4),
    (8, 'peter-kamau', 'grace-wanjiru', 4, 2),
    (9, 'david-njoroge', 'mercy-achieng', 4, 3),
    (10, 'samuel-kariuki', 'kevin-omondi', 4, 2)
  ) AS v(mn, home_slug, away_slug, hs, aw)
  JOIN public.players p1 ON p1.slug = v.home_slug
  JOIN public.players p2 ON p2.slug = v.away_slug
  WHERE f.fixture_number = 'FX-2026-001'
  AND NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.fixture_id = f.id AND m.match_number = v.mn);

  -- Matches for live fixture FX-2026-003
  INSERT INTO public.matches (fixture_id, match_number, home_player_id, away_player_id, home_score, away_score, frames_played, winner_id, status)
  SELECT f.id, v.mn, p1.id, p2.id, v.hs, v.aw, v.hs + v.aw,
    CASE WHEN v.hs > v.aw THEN p1.id WHEN v.aw > v.hs THEN p2.id ELSE NULL END, v.st
  FROM public.fixtures f
  CROSS JOIN (VALUES
    (1, 'brian-otieno', 'john-mwesigwa', 4, 2, 'completed'),
    (2, 'james-mwangi', 'patrick-okello', 4, 1, 'completed'),
    (3, 'peter-kamau', 'joseph-ssebunya', 2, 3, 'live'),
    (4, 'david-njoroge', 'john-mwesigwa', 0, 0, 'scheduled'),
    (5, 'samuel-kariuki', 'patrick-okello', 0, 0, 'scheduled')
  ) AS v(mn, home_slug, away_slug, hs, aw, st)
  JOIN public.players p1 ON p1.slug = v.home_slug
  JOIN public.players p2 ON p2.slug = v.away_slug
  WHERE f.fixture_number = 'FX-2026-003'
  AND NOT EXISTS (SELECT 1 FROM public.matches m WHERE m.fixture_id = f.id AND m.match_number = v.mn);

  -- Rankings 8-ball
  INSERT INTO public.rankings (player_id, discipline_id, scope, rank_position, points, period)
  SELECT p.id, d8, 'global', v.rn, v.pts, 'all_time'
  FROM public.players p JOIN (VALUES
    ('brian-otieno', 1, 3200), ('james-mwangi', 2, 2750), ('john-mwesigwa', 3, 2400),
    ('david-njoroge', 4, 2300), ('samuel-kariuki', 5, 2100), ('patrick-okello', 6, 2000)
  ) AS v(slug, rn, pts) ON v.slug = p.slug
  WHERE NOT EXISTS (SELECT 1 FROM public.rankings r WHERE r.player_id = p.id AND r.discipline_id = d8 AND r.scope = 'global');

  -- Rankings 9-ball
  INSERT INTO public.rankings (player_id, discipline_id, scope, rank_position, points, period)
  SELECT p.id, d9, 'global', v.rn, v.pts, 'all_time'
  FROM public.players p JOIN (VALUES
    ('ali-hassan', 1, 2500), ('peter-kamau', 2, 2400), ('cynthia-akoth', 3, 1650), ('eric-mutua', 4, 1450)
  ) AS v(slug, rn, pts) ON v.slug = p.slug
  WHERE NOT EXISTS (SELECT 1 FROM public.rankings r WHERE r.player_id = p.id AND r.discipline_id = d9 AND r.scope = 'global');

  -- Rankings blackball
  INSERT INTO public.rankings (player_id, discipline_id, scope, rank_position, points, period)
  SELECT p.id, db, 'global', v.rn, v.pts, 'all_time'
  FROM public.players p JOIN (VALUES
    ('grace-wanjiru', 1, 2600), ('kevin-omondi', 2, 2350), ('mercy-achieng', 3, 2050),
    ('issa-mwakyusa', 4, 1850), ('joseph-ssebunya', 5, 1750)
  ) AS v(slug, rn, pts) ON v.slug = p.slug
  WHERE NOT EXISTS (SELECT 1 FROM public.rankings r WHERE r.player_id = p.id AND r.discipline_id = db AND r.scope = 'global');
END $$;