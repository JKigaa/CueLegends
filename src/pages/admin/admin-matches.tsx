import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Target } from 'lucide-react';
import type { Match, Player, Fixture } from '@/types/db';

interface AdminMatchesProps {
  navigate: (to: string) => void;
}

interface MatchFormData {
  fixture_id: string;
  match_number: string;
  home_player_id: string;
  away_player_id: string;
  home_score: string;
  away_score: string;
  frames_played: string;
  winner_id: string;
  status: string;
}

const EMPTY_FORM: MatchFormData = {
  fixture_id: 'none', match_number: '1', home_player_id: 'none', away_player_id: 'none',
  home_score: '0', away_score: '0', frames_played: '0', winner_id: 'none', status: 'scheduled',
};

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'walkover', label: 'Walkover' },
];

export function AdminMatches({}: AdminMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MatchFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [mRes, pRes, fRes] = await Promise.all([
      supabase.from('matches').select(`*, home_player:players!matches_home_player_id_fkey(name), away_player:players!matches_away_player_id_fkey(name), fixture:fixtures(competition_name)`).order('created_at', { ascending: false }),
      supabase.from('players').select('*').order('name'),
      supabase.from('fixtures').select('id, competition_name, match_date').order('match_date', { ascending: false }).limit(100),
    ]);
    setMatches((mRes.data ?? []) as Match[]);
    setPlayers((pRes.data ?? []) as Player[]);
    setFixtures((fRes.data ?? []) as Fixture[]);
    setLoading(false);
  };

  const filtered = matches.filter((m) =>
    !search || (m.home_player?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) || (m.away_player?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };

  const openEdit = (m: Match) => {
    setForm({
      fixture_id: m.fixture_id,
      match_number: m.match_number.toString(),
      home_player_id: m.home_player_id ?? 'none',
      away_player_id: m.away_player_id ?? 'none',
      home_score: m.home_score.toString(),
      away_score: m.away_score.toString(),
      frames_played: m.frames_played.toString(),
      winner_id: m.winner_id ?? 'none',
      status: m.status,
    });
    setEditingId(m.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.fixture_id === 'none') { toast.error('A fixture is required'); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      fixture_id: form.fixture_id,
      match_number: parseInt(form.match_number) || 1,
      home_player_id: form.home_player_id === 'none' ? null : form.home_player_id,
      away_player_id: form.away_player_id === 'none' ? null : form.away_player_id,
      home_score: parseInt(form.home_score) || 0,
      away_score: parseInt(form.away_score) || 0,
      frames_played: parseInt(form.frames_played) || 0,
      winner_id: form.winner_id === 'none' ? null : form.winner_id,
      status: form.status,
    };
    const { error } = editingId
      ? await supabase.from('matches').update(payload).eq('id', editingId)
      : await supabase.from('matches').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Match updated' : 'Match created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('matches').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Match deleted');
    setDeleteId(null);
    fetchData();
  };

  const fixtureLabel = (f: Fixture) => `${f.competition_name ?? 'Friendly'} — ${new Date(f.match_date).toLocaleDateString()}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Matches</h1>
          <p className="mt-1 text-sm text-muted-foreground">{matches.length} individual matches</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Match</Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by player..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Target} title="No matches found" description="Create your first individual match to get started." actionLabel="Add Match" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">#{m.match_number} — {m.home_player?.name ?? 'TBD'} vs {m.away_player?.name ?? 'TBD'}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.fixture?.competition_name ?? 'Fixture'} · {m.status} · {m.home_score}-{m.away_score}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Match' : 'Add New Match'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Fixture *</Label><Select value={form.fixture_id} onValueChange={(v) => setForm({ ...form, fixture_id: v })}><SelectTrigger><SelectValue placeholder="Select fixture" /></SelectTrigger><SelectContent>{fixtures.map((f) => <SelectItem key={f.id} value={f.id}>{fixtureLabel(f)}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Match Number</Label><Input type="number" value={form.match_number} onChange={(e) => setForm({ ...form, match_number: e.target.value })} /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Home Player</Label><Select value={form.home_player_id} onValueChange={(v) => setForm({ ...form, home_player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Away Player</Label><Select value={form.away_player_id} onValueChange={(v) => setForm({ ...form, away_player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Home Score</Label><Input type="number" value={form.home_score} onChange={(e) => setForm({ ...form, home_score: e.target.value })} /></div>
              <div className="space-y-2"><Label>Away Score</Label><Input type="number" value={form.away_score} onChange={(e) => setForm({ ...form, away_score: e.target.value })} /></div>
              <div className="space-y-2"><Label>Frames Played</Label><Input type="number" value={form.frames_played} onChange={(e) => setForm({ ...form, frames_played: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Winner</Label><Select value={form.winner_id} onValueChange={(v) => setForm({ ...form, winner_id: v })}><SelectTrigger><SelectValue placeholder="Select winner" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this match?" description="This will permanently remove the match record. This cannot be undone." onConfirm={handleDelete} />
    </div>
  );
}
