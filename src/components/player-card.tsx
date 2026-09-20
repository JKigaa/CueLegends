import { Trophy, MapPin, Star } from 'lucide-react';
import type { Player } from '@/types/db';
import { PLAYER_PHOTOS } from '@/lib/pool-images';
import { winPercentage, getDisciplineLabel } from '@/lib/constants';

interface PlayerCardProps {
  player: Player;
  navigate: (to: string) => void;
  rank?: number;
}

export function PlayerCard({ player, navigate, rank }: PlayerCardProps) {
  const photo = player.photo_url || PLAYER_PHOTOS[player.slug] || '';
  const wp = winPercentage(player.total_wins, player.total_matches);
  const flag = player.country?.flag_emoji || '';
  const clubName = player.current_club?.short_name || player.current_club?.name || 'Free Agent';

  return (
    <button
      onClick={() => navigate(`/players/${player.slug}`)}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
    >
      {/* Avatar / rank */}
      <div className="relative flex-shrink-0">
        <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border transition-colors group-hover:border-primary/40">
          {photo ? (
            <img src={photo} alt={player.name} className="h-full w-full object-cover" />
          ) : (
            <div className="felt-bg flex h-full w-full items-center justify-center text-xl">🎱</div>
          )}
        </div>
        {rank !== undefined && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
            {rank}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {player.name}
          </h3>
          {flag && <span className="text-sm">{flag}</span>}
        </div>
        <p className="text-xs text-muted-foreground">{clubName}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-accent" /> {player.rating.toFixed(2)}
          </span>
          <span>·</span>
          <span>{player.total_wins}W {player.total_losses}L</span>
          <span>·</span>
          <span>{wp}% win rate</span>
          {player.titles > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-accent">
                <Trophy className="h-3 w-3" /> {player.titles}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Discipline badge */}
      <div className="hidden sm:block flex-shrink-0 text-right">
        <span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-secondary-foreground">
          {getDisciplineLabel(player.primary_discipline?.slug)}
        </span>
        <p className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {player.city || '—'}
        </p>
      </div>
    </button>
  );
}
