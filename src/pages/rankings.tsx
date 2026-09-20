import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayerCard } from '@/components/player-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { Player, PoolDiscipline } from '@/types/db';
import { Trophy } from 'lucide-react';

interface RankingsPageProps {
  navigate: (to: string) => void;
}

export function RankingsPage({ navigate }: RankingsPageProps) {
  const [rankings, setRankings] = useState<{ player: Player; points: number; rank: number }[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [activeDiscipline, setActiveDiscipline] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: discData } = await supabase.from('pool_disciplines').select('*').order('sort_order');
      setDisciplines(discData ?? []);
      if (discData && discData.length > 0) {
        setActiveDiscipline(discData[0].slug);
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeDiscipline) return;
    setLoading(true);
    (async () => {
      const disc = disciplines.find((d) => d.slug === activeDiscipline);
      if (!disc) return;

      const { data } = await supabase.from('rankings').select(`
        points, rank_position,
        player:players!rankings_player_id_fkey(*, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*))
      `).eq('discipline_id', disc.id).eq('scope', 'global').order('rank_position', { ascending: true });

      const mapped = (data ?? []).map((r: any) => ({
        player: r.player as Player,
        points: r.points as number,
        rank: r.rank_position as number,
      }));
      setRankings(mapped);
      setLoading(false);
    })();
  }, [activeDiscipline, disciplines]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" />
          <h1 className="font-heading text-3xl font-bold">Global Rankings</h1>
        </div>
        <p className="mt-1 text-muted-foreground">Player rankings by pool discipline</p>
      </div>

      {disciplines.length > 0 && (
        <Tabs value={activeDiscipline} onValueChange={setActiveDiscipline}>
          <TabsList className="mb-4 flex-wrap">
            {disciplines.map((d) => (
              <TabsTrigger key={d.slug} value={d.slug} className="gap-1">
                {d.icon_emoji} {d.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {disciplines.map((d) => (
            <TabsContent key={d.slug} value={d.slug}>
              {/* Podium */}
              {!loading && rankings.length >= 3 && (
                <div className="mb-8 grid grid-cols-3 gap-3">
                  {[1, 0, 2].map((idx) => {
                    const r = rankings[idx];
                    if (!r) return <div key={idx} />;
                    const heights = ['h-32', 'h-40', 'h-28'];
                    const colors = ['bg-muted border-muted', 'bg-accent/10 border-accent/40', 'bg-muted border-muted'];
                    const medals = ['🥈', '🥇', '🥉'];
                    const order = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="mb-2 text-2xl">{medals[order]}</div>
                        <button
                          onClick={() => navigate(`/players/${r.player.slug}`)}
                          className={`flex w-full flex-col items-center justify-end rounded-xl border-2 p-4 ${colors[order]} ${heights[order]}`}
                        >
                          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-border mb-2">
                            <div className="felt-bg flex h-full w-full items-center justify-center text-lg">🎱</div>
                          </div>
                          <p className="font-heading text-sm font-bold text-center">{r.player.name}</p>
                          <p className="text-xs text-muted-foreground">{r.points} pts</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : rankings.length === 0 ? (
                <div className="py-20 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">No rankings for this discipline yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rankings.map((r) => (
                    <PlayerCard key={r.player.id} player={r.player} navigate={navigate} rank={r.rank} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
