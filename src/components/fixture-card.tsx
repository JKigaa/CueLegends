import { Calendar, MapPin } from 'lucide-react';
import type { Fixture } from '@/types/db';
import { formatDateTime, timeUntil, getDisciplineLabel } from '@/lib/constants';

interface FixtureCardProps {
  fixture: Fixture;
  navigate: (to: string) => void;
}

export function FixtureCard({ fixture, navigate }: FixtureCardProps) {
  const isLive = fixture.status === 'live';
  const isCompleted = fixture.status === 'completed';
  const isScheduled = fixture.status === 'scheduled';
  const isPlayerFixture = fixture.fixture_type === 'player';

  const homeName = isPlayerFixture
    ? fixture.home_player?.name || 'TBD'
    : fixture.home_club?.short_name || fixture.home_club?.name || 'TBD';
  const awayName = isPlayerFixture
    ? fixture.away_player?.name || 'TBD'
    : fixture.away_club?.short_name || fixture.away_club?.name || 'TBD';
  const homeFullName = isPlayerFixture
    ? fixture.home_player?.name || 'TBD'
    : fixture.home_club?.name || 'TBD';
  const awayFullName = isPlayerFixture
    ? fixture.away_player?.name || 'TBD'
    : fixture.away_club?.name || 'TBD';

  return (
    <button
      onClick={() => navigate(`/fixtures/${fixture.id}`)}
      className={`group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-lg ${
        isLive
          ? 'border-success/40 bg-success/5'
          : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          {fixture.competition_name || 'Friendly'}
          {fixture.round ? ` · ${fixture.round}` : ''}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase text-success-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse-dot" />
            Live
          </span>
        )}
        {isCompleted && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
            Result
          </span>
        )}
        {isScheduled && (
          <span className="text-[10px] font-bold uppercase text-primary">
            {timeUntil(fixture.match_date)}
          </span>
        )}
      </div>

      {/* Score / Teams */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col items-center gap-1">
          <span className="font-heading text-sm font-bold text-foreground text-center">{homeName}</span>
          {isPlayerFixture && homeName !== homeFullName && (
            <span className="text-[10px] text-muted-foreground">{homeFullName}</span>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {isScheduled ? (
            <span className="text-lg font-bold text-muted-foreground">VS</span>
          ) : (
            <>
              <span className={`text-2xl font-heading font-bold ${isLive ? 'text-success' : 'text-foreground'}`}>
                {fixture.home_score}
              </span>
              <span className="text-sm text-muted-foreground">-</span>
              <span className={`text-2xl font-heading font-bold ${isLive ? 'text-success' : 'text-foreground'}`}>
                {fixture.away_score}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span className="font-heading text-sm font-bold text-foreground text-center">{awayName}</span>
          {isPlayerFixture && awayName !== awayFullName && (
            <span className="text-[10px] text-muted-foreground">{awayFullName}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {formatDateTime(fixture.match_date)}
        </span>
        <span className="flex items-center gap-2">
          {fixture.venue_city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {fixture.venue_city}
            </span>
          )}
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase">
            {getDisciplineLabel(fixture.discipline?.slug)}
          </span>
        </span>
      </div>
    </button>
  );
}
