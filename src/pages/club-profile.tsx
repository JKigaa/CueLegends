import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CLUB_COVERS, POOL_IMAGES } from '@/lib/pool-images';
import { PlayerCard } from '@/components/player-card';
import { FixtureCard } from '@/components/fixture-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Trophy, Target, TrendingUp, Users, ArrowLeft, CircleDot } from 'lucide-react';
import { winPercentage, formatDate, getDisciplineLabel } from '@/lib/constants';
import type { Club, Player, Fixture, PoolDiscipline } from '@/types/db';

interface ClubProfilePageProps {
  navigate: (to: string) => void;
  slug: string;
}

export function ClubProfilePage({ navigate, slug }: ClubProfilePageProps) {
  const [club, setClub] = useState<Club | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: clubData } = await supabase.from('clubs').select(`
        *, country:countries(*), primary_discipline:pool_disciplines!clubs_primary_discipline_id_fkey(*)
      `).eq('slug', slug).maybeSingle();
      if (!clubData) { setLoading(false); return; }
      setClub(clubData as Club);

      const clubId = clubData.id;

      const [playersRes, homeFxRes, awayFxRes, discRes] = await Promise.all([
        supabase.from('players').select(`
          *, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)
        `).eq('current_club_id', clubId).order('ranking_points', { ascending: false }),
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('home_club_id', clubId).order('match_date', { ascending: false }).limit(10),
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('away_club_id', clubId).order('match_date', { ascending: false }).limit(10),
        supabase.from('club_disciplines').select(`
          discipline:pool_disciplines(*)
        `).eq('club_id', clubId),
      ]);

      setPlayers((playersRes.data ?? []) as Player[]);
      const allFx = [...(homeFxRes.data ?? []), ...(awayFxRes.data ?? [])] as Fixture[];
      allFx.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
      setFixtures(allFx.slice(0, 10));
      setDisciplines((discRes.data ?? []).map((d: any) => d.discipline as PoolDiscipline));
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-48 w-full rounded-xl" />
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Club not found</h1>
        <Button className="mt-4" onClick={() => navigate('/clubs')}>Back to Clubs</Button>
      </div>
    );
  }

  const cover = club.cover_url || CLUB_COVERS[club.slug] || POOL_IMAGES.poolHall;
  const wp = winPercentage(club.total_wins, club.total_matches);
  const flag = club.country?.flag_emoji || '';

  return (
    <div>
      {/* Cover */}
      <div className="relative h-56 overflow-hidden sm:h-72">
        <img src={cover} alt={club.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <button
          onClick={() => navigate('/clubs')}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-lg bg-black/30 px-3 py-1.5 text-sm text-white backdrop-blur transition-colors hover:bg-black/50"
        >
          <ArrowLeft className="h-4 w-4" /> Clubs
        </button>
      </div>

      {/* Club header */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-lg">
            <div className="felt-bg flex h-full w-full items-center justify-center text-3xl">🎱</div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold sm:text-3xl">{club.name}</h1>
              {flag && <span className="text-xl">{flag}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
              <MapPin className="mr-1 inline h-3.5 w-3.5" />
              {club.venue_name}{club.venue_name && club.city ? ', ' : ''}{club.city}
              {club.founded_year ? ` · Est. ${club.founded_year}` : ''}
            </p>
          </div>
        </div>

        {club.description && (
          <p className="mt-4 text-sm text-muted-foreground">{club.description}</p>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { label: 'Matches', value: club.total_matches, icon: Calendar },
            { label: 'Wins', value: club.total_wins, icon: TrendingUp },
            { label: 'Win Rate', value: `${wp}%`, icon: Target },
            { label: 'Trophies', value: club.trophies, icon: Trophy },
            { label: 'Players', value: players.length, icon: Users },
            { label: 'Ranking Pts', value: club.ranking_points, icon: CircleDot },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <stat.icon className="mx-auto mb-1 h-4 w-4 text-primary" />
              <p className="font-heading text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Disciplines */}
        {disciplines.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {disciplines.map((d) => (
              <span key={d.id} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {d.icon_emoji} {d.name}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="squad" className="mt-8">
          <TabsList>
            <TabsTrigger value="squad">Squad ({players.length})</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures ({fixtures.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="squad" className="mt-4">
            {players.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No registered players yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {players.map((p) => (
                  <PlayerCard key={p.id} player={p} navigate={navigate} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fixtures" className="mt-4">
            {fixtures.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No fixtures yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {fixtures.map((fx) => (
                  <FixtureCard key={fx.id} fixture={fx} navigate={navigate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="h-8" />
    </div>
  );
}
