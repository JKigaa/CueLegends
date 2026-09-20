import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ClubCard } from '@/components/club-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Club, Country } from '@/types/db';
import { Search, Trophy } from 'lucide-react';

interface ClubsPageProps {
  navigate: (to: string) => void;
}

export function ClubsPage({ navigate }: ClubsPageProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ranking');

  useEffect(() => {
    (async () => {
      const { data: clubsData } = await supabase.from('clubs').select(`
        *, country:countries(*), primary_discipline:pool_disciplines!clubs_primary_discipline_id_fkey(*)
      `).order('ranking_points', { ascending: false });
      setClubs((clubsData ?? []) as Club[]);

      const { data: countriesData } = await supabase.from('countries').select('*').order('name');
      setCountries(countriesData ?? []);
      setLoading(false);
    })();
  }, []);

  // Fetch player counts per club
  useEffect(() => {
    if (clubs.length === 0) return;
    (async () => {
      const updated = await Promise.all(
        clubs.map(async (club) => {
          const { count } = await supabase
            .from('club_players')
            .select('id', { count: 'exact', head: true })
            .eq('club_id', club.id)
            .eq('is_current', true);
          return { ...club, player_count: count ?? 0 };
        })
      );
      setClubs(updated);
    })();
  }, []);

  const filtered = clubs
    .filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.city?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCountry = countryFilter === 'all' || c.country_id === countryFilter;
      return matchSearch && matchCountry;
    })
    .sort((a, b) => {
      if (sortBy === 'ranking') return b.ranking_points - a.ranking_points;
      if (sortBy === 'wins') return b.total_wins - a.total_wins;
      if (sortBy === 'trophies') return b.trophies - a.trophies;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Clubs Directory</h1>
        <p className="mt-1 text-muted-foreground">Discover pool clubs from across the region</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clubs..." className="pl-9" />
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
            <SelectItem value="wins">Most Wins</SelectItem>
            <SelectItem value="trophies">Trophies</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? 'Loading...' : `${filtered.length} club${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-muted-foreground">No clubs found matching your filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCountryFilter('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((club) => (
            <ClubCard key={club.id} club={club} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}
