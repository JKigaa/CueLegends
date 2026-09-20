export interface Country {
  id: string;
  name: string;
  iso_code: string;
  flag_emoji: string | null;
  created_at: string;
}

export interface PoolDiscipline {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_emoji: string | null;
  sort_order: number;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  short_name: string | null;
  logo_url: string | null;
  cover_url: string | null;
  country_id: string | null;
  region: string | null;
  city: string | null;
  venue_name: string | null;
  venue_address: string | null;
  founded_year: number | null;
  description: string | null;
  primary_discipline_id: string | null;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_frames_won: number;
  total_frames_lost: number;
  trophies: number;
  ranking_points: number;
  is_active: boolean;
  created_at: string;
  // Joined fields
  country?: Country | null;
  primary_discipline?: PoolDiscipline | null;
  disciplines?: PoolDiscipline[];
  player_count?: number;
}

export interface Player {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  cover_url: string | null;
  country_id: string | null;
  region: string | null;
  city: string | null;
  current_club_id: string | null;
  bio: string | null;
  primary_discipline_id: string | null;
  secondary_disciplines: string[] | null;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  total_frames_won: number;
  total_frames_lost: number;
  titles: number;
  finals: number;
  ranking_points: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  // Joined fields
  country?: Country | null;
  current_club?: Club | null;
  primary_discipline?: PoolDiscipline | null;
}

export interface Fixture {
  id: string;
  fixture_number: string | null;
  fixture_type: string;
  home_club_id: string | null;
  away_club_id: string | null;
  home_player_id: string | null;
  away_player_id: string | null;
  discipline_id: string | null;
  competition_name: string | null;
  round: string | null;
  venue_name: string | null;
  venue_city: string | null;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
  best_of_frames: number;
  is_verified: boolean;
  created_at: string;
  // Joined fields
  home_club?: Club | null;
  away_club?: Club | null;
  home_player?: Player | null;
  away_player?: Player | null;
  discipline?: PoolDiscipline | null;
}

export interface Match {
  id: string;
  fixture_id: string;
  match_number: number;
  home_player_id: string | null;
  away_player_id: string | null;
  home_score: number;
  away_score: number;
  frames_played: number;
  winner_id: string | null;
  status: string;
  created_at: string;
  // Joined fields
  home_player?: Player | null;
  away_player?: Player | null;
  fixture?: Fixture | null;
}

export interface Ranking {
  id: string;
  player_id: string;
  discipline_id: string | null;
  scope: string;
  country_id: string | null;
  rank_position: number | null;
  points: number;
  period: string;
  created_at: string;
  // Joined fields
  player?: Player | null;
  discipline?: PoolDiscipline | null;
}

export interface ClubPlayer {
  id: string;
  club_id: string;
  player_id: string;
  joined_date: string | null;
  left_date: string | null;
  is_current: boolean;
  created_at: string;
  // Joined fields
  player?: Player | null;
  club?: Club | null;
}
