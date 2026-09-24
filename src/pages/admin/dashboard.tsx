import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CircleDot, Calendar, Trophy, Globe, Database, Activity, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  navigate: (to: string) => void;
}

interface Stats {
  clubs: number;
  players: number;
  fixtures: number;
  liveFixtures: number;
  matches: number;
  rankings: number;
  disciplines: number;
  countries: number;
}

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentFixtures, setRecentFixtures] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [clubs, players, fixtures, liveFx, matches, rankings, disciplines, countries] = await Promise.all([
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('fixtures').select('id', { count: 'exact', head: true }),
        supabase.from('fixtures').select('id', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('rankings').select('id', { count: 'exact', head: true }),
        supabase.from('pool_disciplines').select('id', { count: 'exact', head: true }),
        supabase.from('countries').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        clubs: clubs.count ?? 0,
        players: players.count ?? 0,
        fixtures: fixtures.count ?? 0,
        liveFixtures: liveFx.count ?? 0,
        matches: matches.count ?? 0,
        rankings: rankings.count ?? 0,
        disciplines: disciplines.count ?? 0,
        countries: countries.count ?? 0,
      });

     const { data: recent } = await supabase.from('fixtures').select(`
  id, status, match_date, competition_name, fixture_type,
  home_club:clubs!fixtures_home_club_id_fkey(name),
  away_club:clubs!fixtures_away_club_id_fkey(name),
  home_player:players!fixtures_home_player_id_fkey(name),
  away_player:players!fixtures_away_player_id_fkey(name)
`).order('match_date', { ascending: false }).limit(5);
      setRecentFixtures(recent ?? []);
    })();
  }, []);

  const cards = [
    { label: 'Clubs', value: stats?.clubs, icon: Users, path: '/admin/clubs', color: 'text-primary' },
    { label: 'Players', value: stats?.players, icon: CircleDot, path: '/admin/players', color: 'text-accent' },
    { label: 'Fixtures', value: stats?.fixtures, icon: Calendar, path: '/admin/fixtures', color: 'text-success' },
    { label: 'Live Now', value: stats?.liveFixtures, icon: Activity, path: '/admin/fixtures', color: 'text-destructive' },
    { label: 'Matches', value: stats?.matches, icon: TrendingUp, path: '/admin/matches', color: 'text-primary' },
    { label: 'Rankings', value: stats?.rankings, icon: Trophy, path: '/admin/rankings', color: 'text-warning' },
    { label: 'Disciplines', value: stats?.disciplines, icon: Database, path: '/admin/disciplines', color: 'text-muted-foreground' },
    { label: 'Countries', value: stats?.countries, icon: Globe, path: '/admin/countries', color: 'text-muted-foreground' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform overview and quick access to all management areas</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold">
                {card.value === undefined ? '...' : card.value}
              </p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent fixtures */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Recent Fixtures</h2>
          <button
            onClick={() => navigate('/admin/fixtures')}
            className="text-sm text-primary hover:underline"
          >
            Manage all
          </button>
        </div>
        {recentFixtures.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No fixtures yet.</p>
        ) : (
          <div className="space-y-2">
            {recentFixtures.map((fx) => (
              <button
                key={fx.id}
                onClick={() => navigate(`/admin/fixtures`)}
                className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-2 w-2 rounded-full ${
                    fx.status === 'live' ? 'bg-success' :
                    fx.status === 'completed' ? 'bg-muted-foreground' :
                    'bg-primary'
                  }`} />
                  <span className="font-medium">
                    {fx.fixture_type === 'player'
  ? `${fx.home_player?.name ?? 'TBD'} vs ${fx.away_player?.name ?? 'TBD'}`
  : `${fx.home_club?.name ?? 'TBD'} vs ${fx.away_club?.name ?? 'TBD'}`}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {fx.status} · {fx.competition_name ?? 'Friendly'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
