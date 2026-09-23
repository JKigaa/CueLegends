import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PLAYER_PHOTOS, POOL_IMAGES } from '@/lib/pool-images';
import { FixtureCard } from '@/components/fixture-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Trophy, Star, Target, TrendingUp, Calendar, CircleDot, Award, ArrowRight } from 'lucide-react';
import { winPercentage, getDisciplineLabel, formatDate, formatDateTime, timeUntil } from '@/lib/constants';
import type { Player, Match, Fixture } from '@/types/db';

interface PlayerProfilePageProps {
  navigate: (to: string) => void;
  slug: string;
}

export function PlayerProfilePage({ navigate, slug }: PlayerProfilePageProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerFixtures, setPlayerFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: playerData } = await supabase.from('players').select(`
        *, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)
      `).eq('slug', slug).maybeSingle();
      if (!playerData) { setLoading(false); return; }
      setPlayer(playerData as Player);

      // Get direct player fixtures (player vs player)
      const [homeFxRes, awayFxRes] = await Promise.all([
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          home_player:players!fixtures_home_player_id_fkey(*), away_player:players!fixtures_away_player_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('fixture_type', 'player').eq('home_player_id', playerData.id).order('match_date', { ascending: true }).limit(10),
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          home_player:players!fixtures_home_player_id_fkey(*), away_player:players!fixtures_away_player_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('fixture_type', 'player').eq('away_player_id', playerData.id).order('match_date', { ascending: true }).limit(10),
      ]);
      const allFx = [...(homeFxRes.data ?? []), ...(awayFxRes.data ?? [])] as Fixture[];
      allFx.sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
      setPlayerFixtures(allFx);

      // Get matches involving this player
      const [homeRes, awayRes] = await Promise.all([
        supabase.from('matches').select(`
          *, home_player:players!matches_home_player_id_fkey(*), away_player:players!matches_away_player_id_fkey(*),
          fixture:fixtures(*)
        `).eq('home_player_id', playerData.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(10),
        supabase.from('matches').select(`
          *, home_player:players!matches_home_player_id_fkey(*), away_player:players!matches_away_player_id_fkey(*),
          fixture:fixtures(*)
        `).eq('away_player_id', playerData.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(10),
      ]);

      const allMatches = [...(homeRes.data ?? []), ...(awayRes.data ?? [])] as Match[];
      allMatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMatches(allMatches.slice(0, 10));
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-40 w-full rounded-xl" />
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Player not found</h1>
        <Button className="mt-4" onClick={() => navigate('/players')}>Back to Players</Button>
      </div>
    );
  }

  const photo = player.photo_url || PLAYER_PHOTOS[player.slug] || '';
  const cover = POOL_IMAGES.playerCue;
  const wp = winPercentage(player.total_wins, player.total_matches);
  const flag = player.country?.flag_emoji || '';

  return (
    <div>
      {/* Cover */}
      <div className="relative h-44 overflow-hidden sm:h-56">
        <img src={cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <button
          onClick={() => navigate('/players')}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-lg bg-black/30 px-3 py-1.5 text-sm text-white backdrop-blur transition-colors hover:bg-black/50"
        >
          <ArrowLeft className="h-4 w-4" /> Players
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-4 border-background bg-card shadow-lg">
            {photo ? (
              <img src={photo} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              <div className="felt-bg flex h-full w-full items-center justify-center text-3xl">🎱</div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">{player.name}</h1>
              {flag && <span className="text-xl">{flag}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
              {player.current_club ? (
                <button onClick={() => navigate(`/clubs/${player.current_club!.slug}`)} className="hover:text-primary hover:underline">
                  {player.current_club.name}
                </button>
              ) : 'Free Agent'}
              {player.city ? ` · ${player.city}` : ''}
              {player.primary_discipline ? ` · ${getDisciplineLabel(player.primary_discipline.slug)}` : ''}
            </p>
          </div>
          <div className="flex gap-2 pb-2">
            <div className="rounded-xl bg-secondary px-4 py-2 text-center">
              <p className="flex items-center gap-1 font-heading text-xl font-bold text-accent">
                <Star className="h-4 w-4" /> {player.rating.toFixed(2)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>

        {player.bio && (
          <p className="mt-4 text-sm text-muted-foreground">{player.bio}</p>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Matches', value: player.total_matches, icon: Calendar },
            { label: 'Wins', value: player.total_wins, icon: TrendingUp },
            { label: 'Win Rate', value: `${wp}%`, icon: Target },
            { label: 'Titles', value: player.titles, icon: Trophy },
            { label: 'Finals', value: player.finals, icon: Award },
            { label: 'Frames W/L', value: `${player.total_frames_won}/${player.total_frames_lost}`, icon: CircleDot },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <stat.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
              <p className="font-heading text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Secondary disciplines */}
        {player.secondary_disciplines && player.secondary_disciplines.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Also plays:</span>
            {player.secondary_disciplines.map((d) => (
              <span key={d} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {getDisciplineLabel(d)}
              </span>
            ))}
          </div>
        )}

        {/* Upcoming Player Fixtures */}
        {playerFixtures.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-heading text-xl font-bold">Player Fixtures</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {playerFixtures.map((fx) => {
                const isHome = fx.home_player_id === player.id;
                const opp = isHome ? fx.away_player : fx.home_player;
                const isScheduled = fx.status === 'scheduled';
                const isLive = fx.status === 'live';
                const isCompleted = fx.status === 'completed';
                const won = isCompleted && (
                  (isHome && fx.home_score > fx.away_score) ||
                  (!isHome && fx.away_score > fx.home_score)
                );
                return (
                  <button
                    key={fx.id}
                    onClick={() => navigate(`/fixtures/${fx.id}`)}
                    className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                      isLive ? 'border-success/40 bg-success/5' : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{fx.competition_name || 'Friendly'}{fx.round ? ` · ${fx.round}` : ''}</span>
                      {isScheduled && <span className="text-[10px] font-bold uppercase text-primary">{timeUntil(fx.match_date)}</span>}
                      {isLive && <span className="flex items-center gap-1 rounded-full bg-success px-1.5 py-0.5 text-[10px] font-bold uppercase text-success-foreground"><span className="h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse-dot" />Live</span>}
                      {isCompleted && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Result</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex-1 font-heading text-sm font-bold text-center ${isCompleted && isHome && won ? 'text-success' : ''}`}>{fx.home_player?.name || 'TBD'}</span>
                      {isScheduled ? (
                        <span className="text-sm font-bold text-muted-foreground">VS</span>
                      ) : (
                        <span className={`font-heading text-lg font-bold ${isLive ? 'text-success' : ''}`}>{fx.home_score} - {fx.away_score}</span>
                      )}
                      <span className={`flex-1 font-heading text-sm font-bold text-center ${isCompleted && !isHome && won ? 'text-success' : ''}`}>{fx.away_player?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateTime(fx.match_date)}</span>
                      {fx.venue_city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {fx.venue_city}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Match history */}
        <div className="mt-8">
          <h2 className="mb-4 font-heading text-xl font-bold">Recent Matches</h2>
          {matches.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-10 text-center">
              <CircleDot className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No completed matches yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => {
                const isHome = m.home_player_id === player.id;
                const myScore = isHome ? m.home_score : m.away_score;
                const oppScore = isHome ? m.away_score : m.home_score;
                const opp = isHome ? m.away_player : m.home_player;
                const won = m.winner_id === player.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => m.fixture && navigate(`/fixtures/${m.fixture.id}`)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:shadow-md ${
                      won ? 'border-success/30 bg-success/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      won ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {won ? 'W' : 'L'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        vs {opp?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.fixture?.competition_name || 'Match'} · {m.fixture && formatDate(m.fixture.match_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-heading text-lg font-bold">
                      <span className={won ? 'text-success' : 'text-foreground'}>{myScore}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-muted-foreground">{oppScore}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
