import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (!data.session?.user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      const { data: adminRecord, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (!mounted) return;

      setIsAdmin(!error && !!adminRecord);
      setAdminLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (!newSession?.user) {
          setIsAdmin(false);
          setAdminLoading(false);
        } else {
          setAdminLoading(true);

          supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', newSession.user.id)
            .maybeSingle()
            .then(({ data: adminRecord, error }) => {
              if (!mounted) return;

              setIsAdmin(!error && !!adminRecord);
              setAdminLoading(false);
            });
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    adminLoading,
    signIn,
    signOut,
  };
}