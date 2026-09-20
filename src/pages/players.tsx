import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PlayerCard } from '@/components/player-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Player, Country } from '@/types/db';
import { Search, CircleDot } from 'lucide-react';

interface PlayersPageProps {
  navigate: (to: string) => void;
}

export function PlayersPage({ navigate }: PlayersPageProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ranking');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('players').select(`
        *, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)
      `).order('ranking_points', { ascending: false });
      setPlayers((data ?? []) as Player[]);

      const { data: countriesData } = await supabase.from('countries').select('*').order('name');
      setCountries(countriesData ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = players
    .filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.current_club?.name?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCountry = countryFilter === 'all' || p.country_id === countryFilter;
      return matchSearch && matchCountry;
    })
    .sort((a, b) => {
      if (sortBy === 'ranking') return b.ranking_points - a.ranking_points;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'wins') return b.total_wins - a.total_wins;
      if (sortBy === 'titles') return b.titles - a.titles;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Players Directory</h1>
        <p className="mt-1 text-muted-foreground">Browse pool players from across the platform</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players or clubs..." className="pl-9" />
        </div>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.flag_emoji} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ranking">Ranking Points</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="wins">Most Wins</SelectItem>
            <SelectItem value="titles">Titles</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? 'Loading...' : `${filtered.length} player${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <CircleDot className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">No players found matching your filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCountryFilter('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((p, i) => (
            <PlayerCard key={p.id} player={p} navigate={navigate} rank={sortBy === 'ranking' ? i + 1 : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
