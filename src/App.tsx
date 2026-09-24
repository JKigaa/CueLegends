import { useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import { useHashRouter } from '@/hooks/use-router';
import { useAuth } from '@/hooks/use-auth';
import { HomePage } from '@/pages/home';
import { ClubsPage } from '@/pages/clubs';
import { ClubProfilePage } from '@/pages/club-profile';
import { PlayersPage } from '@/pages/players';
import { PlayerProfilePage } from '@/pages/player-profile';
import { FixturesPage } from '@/pages/fixtures';
import { FixtureDetailPage } from '@/pages/fixture-detail';
import { RankingsPage } from '@/pages/rankings';
import { SearchPage } from '@/pages/search';
import { AdminLogin } from '@/pages/admin/login';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDashboard } from '@/pages/admin/dashboard';
import { AdminClubs } from '@/pages/admin/admin-clubs';
import { AdminPlayers } from '@/pages/admin/admin-players';
import { AdminFixtures } from '@/pages/admin/admin-fixtures';
import { AdminMatches } from '@/pages/admin/admin-matches';
import { AdminRankings } from '@/pages/admin/admin-rankings';
import { AdminDisciplines } from '@/pages/admin/admin-disciplines';
import { AdminCountries } from '@/pages/admin/admin-countries';
import { PLATFORM_NAME } from '@/lib/constants';

export default function App() {
  const router = useHashRouter();
  const { path, segments, navigate, params } = router;
  const auth = useAuth();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': `${PLATFORM_NAME} — Global Pool Sports Platform`,
      '/clubs': 'Clubs — CueLeague',
      '/players': 'Players — CueLeague',
      '/fixtures': 'Fixtures & Results — CueLeague',
      '/rankings': 'Rankings — CueLeague',
      '/search': 'Search — CueLeague',
      '/admin': 'Admin Dashboard — CueLeague',
      '/admin/clubs': 'Manage Clubs — CueLeague Admin',
      '/admin/players': 'Manage Players — CueLeague Admin',
      '/admin/fixtures': 'Manage Fixtures — CueLeague Admin',
      '/admin/matches': 'Manage Matches — CueLeague Admin',
      '/admin/rankings': 'Manage Rankings — CueLeague Admin',
      '/admin/disciplines': 'Manage Disciplines — CueLeague Admin',
      '/admin/countries': 'Manage Countries — CueLeague Admin',
      '/admin/login': 'Admin Login — CueLeague',
    };
    document.title = titles[path] ?? `${PLATFORM_NAME} — Global Pool Sports Platform`;
  }, [path]);

  const top = segments[0] ?? '';

  // Admin routes — handle separately, no public navbar/footer
  if (top === 'admin') {
    const sub = segments[1] ?? '';

    // Login page — no auth required
    if (sub === 'login') {
      return (
        <>
          <AdminLogin navigate={navigate} />
          <Toaster richColors position="bottom-right" />
        </>
      );
    }

    // All other admin pages require authentication
        // All other admin pages require an authenticated administrator
    if (auth.loading || auth.adminLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="mb-3 text-3xl">🎱</div>
            <p className="text-sm text-muted-foreground">
              Loading admin panel...
            </p>
          </div>
        </div>
      );
    }

    // Not signed in — send to admin login
    if (!auth.user) {
      return (
        <>
          <AdminLogin navigate={navigate} />
          <Toaster richColors position="bottom-right" />
        </>
      );
    }

    // Signed in but not an administrator — deny access
    if (!auth.isAdmin) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-8 text-center shadow-sm">
            <div className="mb-4 text-4xl">🔒</div>
            <h1 className="text-xl font-semibold">Admin Access Required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is restricted to CueLegends administrators.
            </p>
            <button
              type="button"
              onClick={async () => {
                await auth.signOut();
                navigate('/admin/login');
              }}
              className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Return to Admin Login
            </button>
          </div>
          <Toaster richColors position="bottom-right" />
        </div>
      );
    }

    const activeSection = sub || 'dashboard';

    function renderAdminPage() {
      if (sub === '') return <AdminDashboard navigate={navigate} />;
      if (sub === 'clubs') return <AdminClubs navigate={navigate} />;
      if (sub === 'players') return <AdminPlayers navigate={navigate} />;
      if (sub === 'fixtures') return <AdminFixtures navigate={navigate} />;
      if (sub === 'matches') return <AdminMatches navigate={navigate} />;
      if (sub === 'rankings') return <AdminRankings navigate={navigate} />;
      if (sub === 'disciplines') return <AdminDisciplines navigate={navigate} />;
      if (sub === 'countries') return <AdminCountries navigate={navigate} />;
      return <AdminDashboard navigate={navigate} />;
    }

    return (
      <>
        <AdminLayout
          navigate={navigate}
          activeSection={activeSection}
          onSignOut={auth.signOut}
        >
          {renderAdminPage()}
        </AdminLayout>
        <Toaster richColors position="bottom-right" />
      </>
    );
    }

  // Public routes
  function renderPage() {
    if (top === '') return <HomePage navigate={navigate} />;
    if (top === 'clubs' && segments[1]) return <ClubProfilePage navigate={navigate} slug={segments[1]} />;
    if (top === 'clubs') return <ClubsPage navigate={navigate} />;
    if (top === 'players' && segments[1]) return <PlayerProfilePage navigate={navigate} slug={segments[1]} />;
    if (top === 'players') return <PlayersPage navigate={navigate} />;
    if (top === 'fixtures' && segments[1]) return <FixtureDetailPage navigate={navigate} fixtureId={segments[1]} />;
    if (top === 'fixtures') return <FixturesPage navigate={navigate} params={params} />;
    if (top === 'rankings') return <RankingsPage navigate={navigate} />;
    if (top === 'search') return <SearchPage navigate={navigate} params={params} />;
    return <HomePage navigate={navigate} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigate={navigate} path={path} />
      <main className="flex-1">{renderPage()}</main>
      <Footer navigate={navigate} />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
