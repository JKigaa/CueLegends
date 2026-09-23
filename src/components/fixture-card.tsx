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

  const handleParticipantClick = (
    event: React.MouseEvent,
    path: string | null,
  ) => {
    event.stopPropagation();

    if (path) {
      navigate(path);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/fixtures/${fixture.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/fixtures/${fixture.id}`);
        }
      }}
      className={`group flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-300 hover:shadow-lg ${
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
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success-foreground" />
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
          {isPlayerFixture ? (
            <button
              type="button"
              onClick={(event) =>
                handleParticipantClick(
                  event,
                  fixture.home_player?.slug
                    ? `/players/${fixture.home_player.slug}`
                    : null,
                )
              }
              disabled={!fixture.home_player?.slug}
              className="font-heading text-center text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline disabled:cursor-default disabled:hover:text-foreground disabled:hover:no-underline"
            >
              {homeName}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) =>
                handleParticipantClick(
                  event,
                  fixture.home_club?.slug
                    ? `/clubs/${fixture.home_club.slug}`
                    : null,
                )
              }
              disabled={!fixture.home_club?.slug}
              className="font-heading text-center text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline disabled:cursor-default disabled:hover:text-foreground disabled:hover:no-underline"
            >
              {homeName}
            </button>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {isScheduled ? (
            <span className="text-lg font-bold text-muted-foreground">VS</span>
          ) : (
            <>
              <span
                className={`font-heading text-2xl font-bold ${
                  isLive ? 'text-success' : 'text-foreground'
                }`}
              >
                {fixture.home_score}
              </span>

              <span className="text-sm text-muted-foreground">-</span>

              <span
                className={`font-heading text-2xl font-bold ${
                  isLive ? 'text-success' : 'text-foreground'
                }`}
              >
                {fixture.away_score}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          {isPlayerFixture ? (
            <button
              type="button"
              onClick={(event) =>
                handleParticipantClick(
                  event,
                  fixture.away_player?.slug
                    ? `/players/${fixture.away_player.slug}`
                    : null,
                )
              }
              disabled={!fixture.away_player?.slug}
              className="font-heading text-center text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline disabled:cursor-default disabled:hover:text-foreground disabled:hover:no-underline"
            >
              {awayName}
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) =>
                handleParticipantClick(
                  event,
                  fixture.away_club?.slug
                    ? `/clubs/${fixture.away_club.slug}`
                    : null,
                )
              }
              disabled={!fixture.away_club?.slug}
              className="font-heading text-center text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline disabled:cursor-default disabled:hover:text-foreground disabled:hover:no-underline"
            >
              {awayName}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDateTime(fixture.match_date)}
        </span>

        <span className="flex items-center gap-2">
          {fixture.venue_city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {fixture.venue_city}
            </span>
          )}

          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase">
            {getDisciplineLabel(fixture.discipline?.slug)}
          </span>
        </span>
      </div>
    </div>
  );
}