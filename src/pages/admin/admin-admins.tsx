import { useEffect, useState } from 'react';
import {
  Mail,
  ShieldCheck,
  UserMinus,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
};

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? null);
  };

  const loadAdmins = async () => {
    setLoading(true);
    setError('');

    const { data, error: functionError } = await supabase.functions.invoke(
      'manage-admin',
      {
        body: { action: 'list' },
      }
    );

    if (functionError) {
      setError(functionError.message);
      setAdmins([]);
      setLoading(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setAdmins([]);
      setLoading(false);
      return;
    }

    setAdmins(data?.admins ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadCurrentUser();
    loadAdmins();
  }, []);

  const addAdmin = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Enter an email address.');
      return;
    }

    setAdding(true);
    setError('');
    setMessage('');

    const { data, error: functionError } = await supabase.functions.invoke(
      'manage-admin',
      {
        body: {
          action: 'add',
          email: trimmedEmail,
        },
      }
    );

    if (functionError) {
      setError(functionError.message);
      setAdding(false);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setAdding(false);
      return;
    }

    setMessage('Administrator invitation sent successfully.');
    setEmail('');
    setAdding(false);
    await loadAdmins();
  };

  const removeAdmin = async (userId: string) => {
    if (userId === currentUserId) {
      setError('You cannot remove your own administrator access.');
      return;
    }

    const confirmed = window.confirm(
      'Remove administrator access for this user? Their Supabase account will not be deleted.'
    );

    if (!confirmed) return;

    setRemovingId(userId);
    setError('');
    setMessage('');

    const { data, error: functionError } = await supabase.functions.invoke(
      'manage-admin',
      {
        body: {
          action: 'remove',
          user_id: userId,
        },
      }
    );

    if (functionError) {
      setError(functionError.message);
      setRemovingId(null);
      return;
    }

    if (data?.error) {
      setError(data.error);
      setRemovingId(null);
      return;
    }

    setMessage('Administrator access removed.');
    setRemovingId(null);
    await loadAdmins();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage who has administrator access to CueLegends.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Add Administrator</h2>
          <p className="text-sm text-muted-foreground">
            Send an invitation to another person who will help manage
            CueLegends.
          </p>
        </div>

        <form
          onSubmit={addAdmin}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="administrator@example.com"
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              disabled={adding}
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {adding ? 'Sending...' : 'Invite Administrator'}
          </button>
        </form>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-lg font-semibold">Administrators</h2>
            <p className="text-sm text-muted-foreground">
              Users currently authorised to manage CueLegends.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAdmins}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading administrators...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No administrators found.
          </div>
        ) : (
          <div className="divide-y">
            {admins.map((admin) => {
              const isCurrentUser = admin.user_id === currentUserId;

              return (
                <div
                  key={admin.user_id}
                  className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-medium">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      {admin.email || 'Unknown email'}

                      {isCurrentUser && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current Admin
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Administrator since{' '}
                      {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.user_id)}
                    disabled={isCurrentUser || removingId === admin.user_id}
                    title={
                      isCurrentUser
                        ? 'You cannot remove your own administrator access.'
                        : 'Remove administrator access'
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserMinus className="h-4 w-4" />
                    {isCurrentUser
                      ? 'Current Admin'
                      : removingId === admin.user_id
                        ? 'Removing...'
                        : 'Remove Access'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}