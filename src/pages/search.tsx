import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayerCard } from '@/components/player-card';
import { ClubCard } from '@/components/club-card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Player, Club } from '@/types/db';
import { Search, CircleDot, Trophy } from 'lucide-react';

interface SearchPageProps {
  navigate: (to: string) => void;
  params: Record<string, string>;
}

export function SearchPage({ navigate, params }: SearchPageProps) {
  const [query, setQuery] = useState(params.q || '');
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    (async () => {
      const [playersRes, clubsRes] = await Promise.all([
        supabase.from('players').select(`
          *, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)
        `).ilike('name', `%${query}%`).limit(10),
        supabase.from('clubs').select(`
          *, country:countries(*), primary_discipline:pool_disciplines!clubs_primary_discipline_id_fkey(*)
        `).ilike('name', `%${query}%`).limit(10),
      ]);
      setPlayers((playersRes.data ?? []) as Player[]);
      setClubs((clubsRes.data ?? []) as Club[]);
      setLoading(false);
    })();
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-4 font-heading text-2xl font-bold">Search</h1>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players and clubs..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !query.trim() ? (
        <p className="py-10 text-center text-muted-foreground">Start typing to search...</p>
      ) : players.length === 0 && clubs.length === 0 ? (
        <div className="py-20 text-center">
          <CircleDot className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">No results for "{query}"</p>
        </div>
      ) : (
        <Tabs defaultValue="players">
          <TabsList>
            <TabsTrigger value="players">Players ({players.length})</TabsTrigger>
            <TabsTrigger value="clubs">Clubs ({clubs.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="players" className="mt-4 space-y-2">
            {players.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No players found.</p>
            ) : (
              players.map((p) => <PlayerCard key={p.id} player={p} navigate={navigate} />)
            )}
          </TabsContent>
          <TabsContent value="clubs" className="mt-4 grid gap-3 sm:grid-cols-2">
            {clubs.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No clubs found.</p>
            ) : (
              clubs.map((c) => <ClubCard key={c.id} club={c} navigate={navigate} />)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
