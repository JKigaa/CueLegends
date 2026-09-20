import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FixtureCard } from '@/components/fixture-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Fixture, PoolDiscipline } from '@/types/db';
import { Calendar, Activity, CheckCircle2 } from 'lucide-react';

interface FixturesPageProps {
  navigate: (to: string) => void;
  params: Record<string, string>;
}

export function FixturesPage({ navigate, params }: FixturesPageProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(params.tab || 'all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const { data: discData } = await supabase.from('pool_disciplines').select('*').order('sort_order');
      setDisciplines(discData ?? []);

      const { data } = await supabase.from('fixtures').select(`
        *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
        discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
      `).order('match_date', { ascending: false }).limit(50);
      setFixtures((data ?? []) as Fixture[]);
      setLoading(false);
    })();
  }, []);

  const filtered = fixtures
    .filter((f) => {
      if (activeTab === 'live') return f.status === 'live';
      if (activeTab === 'upcoming') return f.status === 'scheduled';
      if (activeTab === 'results') return f.status === 'completed';
      return true;
    })
    .filter((f) => disciplineFilter === 'all' || f.discipline_id === disciplineFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Fixtures & Results</h1>
        <p className="mt-1 text-muted-foreground">All scheduled, live, and completed matches</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" className="gap-1"><Calendar className="h-3.5 w-3.5" /> All</TabsTrigger>
            <TabsTrigger value="live" className="gap-1"><Activity className="h-3.5 w-3.5" /> Live</TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1"><Calendar className="h-3.5 w-3.5" /> Upcoming</TabsTrigger>
            <TabsTrigger value="results" className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Results</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Discipline" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.icon_emoji} {d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsContent value={activeTab} className="mt-0">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No fixtures found.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((fx) => (
              <FixtureCard key={fx.id} fixture={fx} navigate={navigate} />
            ))}
          </div>
        )}
      </TabsContent>
    </div>
  );
}
