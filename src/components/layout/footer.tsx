import { Logo } from '@/components/brand/logo';
import { PLATFORM_NAME, PLATFORM_DESCRIPTION } from '@/lib/constants';
import { CircleDot, Trophy, Users, Target, Calendar, BarChart3 } from 'lucide-react';

interface FooterProps {
  navigate: (to: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  const links = [
    { label: 'Clubs', path: '/clubs', icon: Users },
    { label: 'Players', path: '/players', icon: CircleDot },
    { label: 'Fixtures', path: '/fixtures', icon: Calendar },
    { label: 'Rankings', path: '/rankings', icon: BarChart3 },
  ];

  return (
    <footer className="felt-card mt-auto border-t border-white/10 text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo variant="light" />
            <p className="text-sm text-white/50 max-w-xs">{PLATFORM_DESCRIPTION}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold uppercase tracking-wider text-white/40">
              Explore
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold uppercase tracking-wider text-white/40">
              Disciplines
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>8️⃣ 8-Ball</li>
              <li>9️⃣ 9-Ball</li>
              <li>⚫ Blackball</li>
              <li>🔟 10-Ball</li>
              <li>🎯 Straight Pool</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-heading font-semibold uppercase tracking-wider text-white/40">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Live Scores</li>
              <li className="flex items-center gap-2"><Target className="h-4 w-4" /> Head-to-Head</li>
              <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Statistics</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {PLATFORM_NAME}. Building the global pool sports ecosystem.
        </div>
      </div>
    </footer>
  );
}
