import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminLoginProps {
  navigate: (path: string) => void;
}

export function AdminLogin({ navigate }: AdminLoginProps) {
  const { signIn, user, loading, isAdmin, adminLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !adminLoading && user && isAdmin) {
      navigate('/admin');
    }
  }, [loading, adminLoading, user, isAdmin, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await signIn(email.trim(), password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  if (loading || (user && adminLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <div className="mb-3 text-3xl">🎱</div>
          <p className="text-sm text-muted-foreground">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CueLegends Admin</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in with your administrator account.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to CueLegends
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}