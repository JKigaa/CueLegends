import { Trophy, MapPin, CircleDot } from 'lucide-react';
import type { Club } from '@/types/db';
import { CLUB_COVERS } from '@/lib/pool-images';
import { winPercentage } from '@/lib/constants';

interface ClubCardProps {
  club: Club;
  navigate: (to: string) => void;
}

export function ClubCard({ club, navigate }: ClubCardProps) {
  const cover = club.cover_url || CLUB_COVERS[club.slug] || '';
  const wp = winPercentage(club.total_wins, club.total_matches);
  const flag = club.country?.flag_emoji || '';

  return (
    <button
      onClick={() => navigate(`/clubs/${club.slug}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
    >
      {/* Cover */}
      <div className="relative h-32 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={club.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="felt-bg h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-white drop-shadow">{club.name}</h3>
            <p className="text-xs text-white/80">
              {flag} {club.city || ''}{club.city && club.region ? ', ' : ''}{club.region}
            </p>
          </div>
          {club.trophies > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-accent/90 px-2 py-0.5 text-xs font-bold text-accent-foreground">
              <Trophy className="h-3 w-3" /> {club.trophies}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{club.total_wins}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Wins</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{club.total_losses}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Losses</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">{wp}%</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Win Rate</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {club.venue_name || 'TBD'}
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="h-3 w-3" /> {club.player_count ?? '—'} players
          </span>
        </div>
      </div>
    </button>
  );
}
