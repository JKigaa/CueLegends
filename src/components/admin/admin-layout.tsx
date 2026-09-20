import { useState } from 'react';
import { LayoutDashboard, Users, CircleDot, Calendar, Target, Trophy, Globe, Database, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  navigate: (to: string) => void;
  activeSection: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { section: 'clubs', label: 'Clubs', icon: Users, path: '/admin/clubs' },
  { section: 'players', label: 'Players', icon: CircleDot, path: '/admin/players' },
  { section: 'fixtures', label: 'Fixtures', icon: Calendar, path: '/admin/fixtures' },
  { section: 'matches', label: 'Matches', icon: Target, path: '/admin/matches' },
  { section: 'rankings', label: 'Rankings', icon: Trophy, path: '/admin/rankings' },
  { section: 'disciplines', label: 'Disciplines', icon: Database, path: '/admin/disciplines' },
  { section: 'countries', label: 'Countries', icon: Globe, path: '/admin/countries' },
];

export function AdminLayout({ navigate, activeSection, onSignOut, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="text-xl">🎱</span>
          <div>
            <p className="font-heading text-sm font-bold">CueLeague</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.section}
              onClick={() => handleNav(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeSection === item.section
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="mt-1 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card animate-fade-in">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎱</span>
                <div>
                  <p className="font-heading text-sm font-bold">CueLeague</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNav(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeSection === item.section
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="border-t border-border p-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full justify-start gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to site
              </Button>
              <Button variant="ghost" size="sm" onClick={onSignOut} className="mt-1 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile top bar */}
        <div className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1 hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg">🎱</span>
          <p className="font-heading text-sm font-bold">CueLeague Admin</p>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
