import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { formatDateTime, formatDate, getDisciplineLabel } from '@/lib/constants';
import type { Fixture, Match, PoolDiscipline } from '@/types/db';

interface FixtureDetailPageProps {
  navigate: (to: string) => void;
  fixtureId: string;
}

export function FixtureDetailPage({ navigate, fixtureId }: FixtureDetailPageProps) {
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [discipline, setDiscipline] = useState<PoolDiscipline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: fxData } = await supabase.from('fixtures').select(`
        *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
        home_player:players!fixtures_home_player_id_fkey(*), away_player:players!fixtures_away_player_id_fkey(*),
        discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
      `).eq('id', fixtureId).maybeSingle();
      if (!fxData) { setLoading(false); return; }
      setFixture(fxData as Fixture);
      setDiscipline(fxData.discipline as PoolDiscipline);

      const { data: matchData } = await supabase.from('matches').select(`
        *, home_player:players!matches_home_player_id_fkey(*), away_player:players!matches_away_player_id_fkey(*)
      `).eq('fixture_id', fixtureId).order('match_number');
      setMatches((matchData ?? []) as Match[]);
      setLoading(false);
    })();
  }, [fixtureId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-40 w-full rounded-xl" />
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Fixture not found</h1>
        <Button className="mt-4" onClick={() => navigate('/fixtures')}>Back to Fixtures</Button>
      </div>
    );
  }

  const isLive = fixture.status === 'live';
  const isCompleted = fixture.status === 'completed';
  const isPlayerFixture = fixture.fixture_type === 'player';
  const homeWon = fixture.home_score > fixture.away_score;
  const awayWon = fixture.away_score > fixture.home_score;
  const homeName = isPlayerFixture ? fixture.home_player?.name || 'TBD' : fixture.home_club?.name || 'TBD';
  const awayName = isPlayerFixture ? fixture.away_player?.name || 'TBD' : fixture.away_club?.name || 'TBD';
  const homeSlug = isPlayerFixture ? fixture.home_player?.slug : fixture.home_club?.slug;
  const awaySlug = isPlayerFixture ? fixture.away_player?.slug : fixture.away_club?.slug;
  const homeLink = isPlayerFixture ? (homeSlug ? `/players/${homeSlug}` : null) : (homeSlug ? `/clubs/${homeSlug}` : null);
  const awayLink = isPlayerFixture ? (awaySlug ? `/players/${awaySlug}` : null) : (awaySlug ? `/clubs/${awaySlug}` : null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/fixtures')}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Fixtures
      </button>

      {/* Fixture header */}
      <div className={`rounded-2xl border p-6 ${isLive ? 'border-success/40 bg-success/5' : 'border-border bg-card'}`}>
        {/* Competition */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {fixture.competition_name || 'Friendly'} · {fixture.round || ''}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase text-success-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse-dot" /> Live
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          )}
          {fixture.status === 'scheduled' && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
              <Clock className="h-3 w-3" /> Upcoming
            </span>
          )}
        </div>

        {/* Score display */}
        <div className="flex items-center justify-between gap-4">
          {homeLink ? (
            <button
              onClick={() => navigate(homeLink)}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="h-14 w-14 rounded-xl felt-bg flex items-center justify-center text-2xl">🎱</div>
              <span className={`font-heading text-sm font-bold text-center ${homeWon && isCompleted ? 'text-success' : ''}`}>
                {homeName}
              </span>
            </button>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-xl felt-bg flex items-center justify-center text-2xl">🎱</div>
              <span className={`font-heading text-sm font-bold text-center ${homeWon && isCompleted ? 'text-success' : ''}`}>
                {homeName}
              </span>
            </div>
          )}

          <div className="flex flex-shrink-0 items-center gap-3">
            {fixture.status === 'scheduled' ? (
              <span className="font-heading text-3xl font-bold text-muted-foreground">VS</span>
            ) : (
              <>
                <span className={`font-heading text-4xl font-bold ${homeWon && isCompleted ? 'text-success' : isLive ? 'text-success' : ''}`}>
                  {fixture.home_score}
                </span>
                <span className="text-lg text-muted-foreground">-</span>
                <span className={`font-heading text-4xl font-bold ${awayWon && isCompleted ? 'text-success' : isLive ? 'text-success' : ''}`}>
                  {fixture.away_score}
                </span>
              </>
            )}
          </div>

          {awayLink ? (
            <button
              onClick={() => navigate(awayLink)}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="h-14 w-14 rounded-xl felt-bg flex items-center justify-center text-2xl">🎱</div>
              <span className={`font-heading text-sm font-bold text-center ${awayWon && isCompleted ? 'text-success' : ''}`}>
                {awayName}
              </span>
            </button>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-xl felt-bg flex items-center justify-center text-2xl">🎱</div>
              <span className={`font-heading text-sm font-bold text-center ${awayWon && isCompleted ? 'text-success' : ''}`}>
                {awayName}
              </span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(fixture.match_date)}</span>
          {fixture.venue_name && (
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {fixture.venue_name}, {fixture.venue_city}</span>
          )}
          {discipline && (
            <span className="rounded bg-secondary px-2 py-0.5 font-medium uppercase">{discipline.icon_emoji} {discipline.name}</span>
          )}
          <span>Best of {fixture.best_of_frames} frames</span>
        </div>
      </div>

      {/* Individual matches */}
      <div className="mt-6">
        <h2 className="mb-3 font-heading text-lg font-bold">Individual Matches</h2>
        {matches.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-10 text-center">
            <p className="text-sm text-muted-foreground">No individual matches have been scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => {
              const homeWon = m.home_score > m.away_score;
              const awayWon = m.away_score > m.home_score;
              const mIsLive = m.status === 'live';
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    mIsLive ? 'border-success/30 bg-success/5' : 'border-border bg-card'
                  }`}
                >
                  <span className="flex-shrink-0 text-xs font-bold text-muted-foreground">#{m.match_number}</span>

                  <button
                    onClick={() => m.home_player && navigate(`/players/${m.home_player.slug}`)}
                    className={`flex flex-1 items-center justify-end gap-2 text-right ${homeWon ? 'font-bold' : 'text-muted-foreground'}`}
                  >
                    <span className="text-sm">{m.home_player?.name || 'TBD'}</span>
                  </button>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    {mIsLive && <span className="text-[10px] font-bold uppercase text-success">LIVE</span>}
                    <span className={`font-heading text-lg font-bold ${homeWon ? 'text-success' : ''}`}>{m.home_score}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className={`font-heading text-lg font-bold ${awayWon ? 'text-success' : ''}`}>{m.away_score}</span>
                  </div>

                  <button
                    onClick={() => m.away_player && navigate(`/players/${m.away_player.slug}`)}
                    className={`flex flex-1 items-center gap-2 ${awayWon ? 'font-bold' : 'text-muted-foreground'}`}
                  >
                    <span className="text-sm">{m.away_player?.name || 'TBD'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verification status */}
      {isCompleted && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {fixture.is_verified ? (
            <><CheckCircle2 className="h-4 w-4 text-success" /> Result verified</>
          ) : (
            <><Clock className="h-4 w-4" /> Pending verification</>
          )}
        </div>
      )}
    </div>
  );
}
