import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PLATFORM_NAME, PLATFORM_TAGLINE, PLATFORM_DESCRIPTION, formatDateTime } from '@/lib/constants';
import { POOL_IMAGES } from '@/lib/pool-images';
import { ClubCard } from '@/components/club-card';
import { PlayerCard } from '@/components/player-card';
import { FixtureCard } from '@/components/fixture-card';
import { Button } from '@/components/ui/button';
import type { Club, Player, Fixture } from '@/types/db';
import { TrendingUp, Trophy, Users, Target, Calendar, ArrowRight, Activity, Globe } from 'lucide-react';

interface HomePageProps {
  navigate: (to: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
  const [recentResults, setRecentResults] = useState<Fixture[]>([]);
  const [topClubs, setTopClubs] = useState<Club[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { data: live },
        { data: upcoming },
        { data: results },
        { data: clubs },
        { data: players },
      ] = await Promise.all([
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('status', 'live').order('match_date'),
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('status', 'scheduled').order('match_date').limit(3),
        supabase.from('fixtures').select(`
          *, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*),
          discipline:pool_disciplines!fixtures_discipline_id_fkey(*)
        `).eq('status', 'completed').order('match_date', { ascending: false }).limit(3),
        supabase.from('clubs').select(`
          *, country:countries(*), primary_discipline:pool_disciplines!clubs_primary_discipline_id_fkey(*)
        `).order('ranking_points', { ascending: false }).limit(4),
        supabase.from('players').select(`
          *, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)
        `).order('ranking_points', { ascending: false }).limit(5),
      ]);

      setLiveFixtures((live ?? []) as Fixture[]);
      setUpcomingFixtures((upcoming ?? []) as Fixture[]);
      setRecentResults((results ?? []) as Fixture[]);
      setTopClubs((clubs ?? []) as Club[]);
      setTopPlayers((players ?? []) as Player[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={POOL_IMAGES.heroMain} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-2xl animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent backdrop-blur">
              <Globe className="h-4 w-4" /> East Africa's Premier Pool Platform
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Where Pool <span className="text-accent">Legends</span> Are Made
            </h1>
            <p className="mt-4 text-lg text-white/80">
              {PLATFORM_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/clubs')} className="gap-2">
                Explore Clubs <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/fixtures')} className="gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white">
                <Calendar className="h-4 w-4" /> View Fixtures
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border sm:grid-cols-4">
          {[
            { label: 'Active Clubs', value: '6', icon: Users, color: 'text-primary' },
            { label: 'Registered Players', value: '18', icon: Target, color: 'text-accent' },
            { label: 'Matches Played', value: '170+', icon: Activity, color: 'text-success' },
            { label: 'Trophies Awarded', value: '10', icon: Trophy, color: 'text-warning' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live matches */}
      {liveFixtures.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-success px-3 py-1 text-sm font-bold text-success-foreground">
              <span className="h-2 w-2 rounded-full bg-success-foreground animate-pulse-dot" /> LIVE NOW
            </span>
            <h2 className="font-heading text-xl font-bold">Live Matches</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveFixtures.map((fx) => (
              <FixtureCard key={fx.id} fixture={fx} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming + Results */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Upcoming Fixtures</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/fixtures')} className="gap-1 text-primary">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              ) : upcomingFixtures.length > 0 ? (
                upcomingFixtures.map((fx) => (
                  <FixtureCard key={fx.id} fixture={fx} navigate={navigate} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>
              )}
            </div>
          </div>

          {/* Recent results */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Recent Results</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/fixtures?tab=results')} className="gap-1 text-primary">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="h-24 animate-pulse rounded-xl bg-muted" />
              ) : recentResults.length > 0 ? (
                recentResults.map((fx) => (
                  <FixtureCard key={fx.id} fixture={fx} navigate={navigate} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent results.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top clubs */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-bold">Top Ranked Clubs</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/clubs')} className="gap-1 text-primary">
            All clubs <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl bg-muted" />
            ))
          ) : (
            topClubs.map((club) => <ClubCard key={club.id} club={club} navigate={navigate} />)
          )}
        </div>
      </section>

      {/* Top players */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Top Ranked Players</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/rankings')} className="gap-1 text-primary">
            Rankings <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))
          ) : (
            topPlayers.map((player, i) => (
              <PlayerCard key={player.id} player={player} navigate={navigate} rank={i + 1} />
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="felt-card mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl felt-bg p-8 text-center text-white sm:p-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <span className="text-4xl">🎱</span>
            <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">Join the {PLATFORM_NAME} Ecosystem</h2>
            <p className="mt-2 text-white/70">
              From local club challenges to international tournaments — {PLATFORM_TAGLINE}.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/players')} className="gap-2">
                Discover Players <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/rankings')} className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                View Rankings
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
