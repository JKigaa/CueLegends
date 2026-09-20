import { useState, useEffect } from 'react';
import { Menu, X, Search, Settings } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  navigate: (to: string) => void;
  path: string;
}

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Clubs', path: '/clubs' },
  { label: 'Players', path: '/players' },
  { label: 'Fixtures', path: '/fixtures' },
  { label: 'Rankings', path: '/rankings' },
];

export function Navbar({ navigate, path }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (linkPath: string) => {
    if (linkPath === '/') return path === '/';
    return path === linkPath || path.startsWith(linkPath + '/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border'
          : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="flex-shrink-0">
          <Logo size="md" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive(link.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop admin link */}
        <button
          onClick={() => navigate('/admin')}
          className="ml-auto hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex lg:hidden"
        >
          <Settings className="h-4 w-4" /> Admin
        </button>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search players, clubs..."
              className="w-56 pl-9"
            />
          </div>
        </form>

        {/* Admin + Mobile toggle */}
        <button
          onClick={() => navigate('/admin')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden animate-fade-in">
          <div className="space-y-1 px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search players, clubs..."
                  className="pl-9"
                />
              </div>
            </form>
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/admin');
                setMobileOpen(false);
              }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-left text-sm font-medium text-secondary-foreground"
            >
              <Settings className="h-4 w-4" /> Admin Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
