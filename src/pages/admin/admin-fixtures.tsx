import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/constants';
import type { Fixture, Club, PoolDiscipline, Player } from '@/types/db';

interface AdminFixturesProps {
  navigate: (to: string) => void;
}

interface FixtureFormData {
  fixture_number: string;
  fixture_type: string;
  home_club_id: string;
  away_club_id: string;
  home_player_id: string;
  away_player_id: string;
  discipline_id: string;
  competition_name: string;
  round: string;
  venue_name: string;
  venue_city: string;
  match_date: string;
  status: string;
  home_score: string;
  away_score: string;
  best_of_frames: string;
  is_verified: boolean;
}

const EMPTY_FORM: FixtureFormData = {
  fixture_number: '', fixture_type: 'club', home_club_id: 'none', away_club_id: 'none',
  home_player_id: 'none', away_player_id: 'none',
  discipline_id: 'none', competition_name: '', round: '', venue_name: '', venue_city: '',
  match_date: '', status: 'scheduled', home_score: '0', away_score: '0', best_of_frames: '7',
  is_verified: false,
};

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminFixtures({}: AdminFixturesProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FixtureFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [fxRes, clubsRes, playersRes, discRes] = await Promise.all([
      supabase.from('fixtures').select(`*, home_club:clubs!fixtures_home_club_id_fkey(*), away_club:clubs!fixtures_away_club_id_fkey(*), home_player:players!fixtures_home_player_id_fkey(*), away_player:players!fixtures_away_player_id_fkey(*), discipline:pool_disciplines!fixtures_discipline_id_fkey(*)`).order('match_date', { ascending: false }),
      supabase.from('clubs').select('*').order('name'),
      supabase.from('players').select('*').order('name'),
      supabase.from('pool_disciplines').select('*').order('sort_order'),
    ]);
    setFixtures((fxRes.data ?? []) as Fixture[]);
    setClubs(clubsRes.data ?? []);
    setPlayers(playersRes.data ?? []);
    setDisciplines(discRes.data ?? []);
    setLoading(false);
  };

  const isPlayerFixture = (f: Fixture) => f.fixture_type === 'player';
  const fixtureLabel = (f: Fixture) => isPlayerFixture(f)
    ? `${f.home_player?.name ?? 'TBD'} vs ${f.away_player?.name ?? 'TBD'}`
    : `${f.home_club?.name ?? 'TBD'} vs ${f.away_club?.name ?? 'TBD'}`;

  const filtered = fixtures
    .filter((f) => statusFilter === 'all' || f.status === statusFilter)
    .filter((f) => !search ||
      (f.home_club?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (f.away_club?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (f.home_player?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (f.away_player?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (f.competition_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );

  const openCreate = () => {
    const now = new Date();
    now.setMinutes(0);
    setForm({ ...EMPTY_FORM, match_date: now.toISOString().slice(0, 16) });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (f: Fixture) => {
    setForm({
      fixture_number: f.fixture_number ?? '',
      fixture_type: f.fixture_type,
      home_club_id: f.home_club_id ?? 'none',
      away_club_id: f.away_club_id ?? 'none',
      home_player_id: f.home_player_id ?? 'none',
      away_player_id: f.away_player_id ?? 'none',
      discipline_id: f.discipline_id ?? 'none',
      competition_name: f.competition_name ?? '',
      round: f.round ?? '',
      venue_name: f.venue_name ?? '',
      venue_city: f.venue_city ?? '',
      match_date: f.match_date.slice(0, 16),
      status: f.status,
      home_score: f.home_score.toString(),
      away_score: f.away_score.toString(),
      best_of_frames: f.best_of_frames.toString(),
      is_verified: f.is_verified,
    });
    setEditingId(f.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.match_date) { toast.error('Match date is required'); return; }
    setSaving(true);
    const isPlayer = form.fixture_type === 'player';
    const payload: Record<string, any> = {
      fixture_number: form.fixture_number.trim() || null,
      fixture_type: form.fixture_type,
      home_club_id: isPlayer ? null : (form.home_club_id === 'none' ? null : form.home_club_id),
      away_club_id: isPlayer ? null : (form.away_club_id === 'none' ? null : form.away_club_id),
      home_player_id: isPlayer ? (form.home_player_id === 'none' ? null : form.home_player_id) : null,
      away_player_id: isPlayer ? (form.away_player_id === 'none' ? null : form.away_player_id) : null,
      discipline_id: form.discipline_id === 'none' ? null : form.discipline_id,
      competition_name: form.competition_name.trim() || null,
      round: form.round.trim() || null,
      venue_name: form.venue_name.trim() || null,
      venue_city: form.venue_city.trim() || null,
      match_date: new Date(form.match_date).toISOString(),
      status: form.status,
      home_score: parseInt(form.home_score) || 0,
      away_score: parseInt(form.away_score) || 0,
      best_of_frames: parseInt(form.best_of_frames) || 7,
      is_verified: form.is_verified,
    };
    const { error } = editingId
      ? await supabase.from('fixtures').update(payload).eq('id', editingId)
      : await supabase.from('fixtures').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Fixture updated' : 'Fixture created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('fixtures').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Fixture deleted');
    setDeleteId(null);
    fetchData();
  };

  const statusColor = (status: string) => {
    if (status === 'live') return 'bg-success text-success-foreground';
    if (status === 'completed') return 'bg-muted text-muted-foreground';
    if (status === 'scheduled') return 'bg-primary/10 text-primary';
    return 'bg-warning/20 text-warning';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Fixtures</h1>
          <p className="mt-1 text-sm text-muted-foreground">{fixtures.length} fixtures on the platform</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Fixture</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fixtures..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No fixtures found" description="Create your first fixture to get started." actionLabel="Add Fixture" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  <span className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(f.status)}`}>{f.status}</span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{fixtureLabel(f)}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {f.competition_name ?? 'Friendly'} · {formatDate(f.match_date)} · {f.home_score}-{f.away_score}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Fixture' : 'Add New Fixture'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Fixture Type</Label><Select value={form.fixture_type} onValueChange={(v) => setForm({ ...form, fixture_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="club">Club vs Club</SelectItem><SelectItem value="player">Player vs Player</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Fixture Number</Label><Input value={form.fixture_number} onChange={(e) => setForm({ ...form, fixture_number: e.target.value })} placeholder="FX-001" /></div>
            </div>
            {form.fixture_type === 'club' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Home Club</Label><Select value={form.home_club_id} onValueChange={(v) => setForm({ ...form, home_club_id: v })}><SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{clubs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Away Club</Label><Select value={form.away_club_id} onValueChange={(v) => setForm({ ...form, away_club_id: v })}><SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{clubs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Home Player</Label><Select value={form.home_player_id} onValueChange={(v) => setForm({ ...form, home_player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Away Player</Label><Select value={form.away_player_id} onValueChange={(v) => setForm({ ...form, away_player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Discipline</Label><Select value={form.discipline_id} onValueChange={(v) => setForm({ ...form, discipline_id: v })}><SelectTrigger><SelectValue placeholder="Select discipline" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.icon_emoji} {d.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Competition Name</Label><Input value={form.competition_name} onChange={(e) => setForm({ ...form, competition_name: e.target.value })} placeholder="Nairobi Open Cup" /></div>
              <div className="space-y-2"><Label>Round</Label><Input value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="Quarter Final" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Venue Name</Label><Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} placeholder="Shark Pool Hall" /></div>
              <div className="space-y-2"><Label>Venue City</Label><Input value={form.venue_city} onChange={(e) => setForm({ ...form, venue_city: e.target.value })} placeholder="Nairobi" /></div>
            </div>
            <div className="space-y-2"><Label>Match Date & Time</Label><Input type="datetime-local" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Home Score</Label><Input type="number" value={form.home_score} onChange={(e) => setForm({ ...form, home_score: e.target.value })} /></div>
              <div className="space-y-2"><Label>Away Score</Label><Input type="number" value={form.away_score} onChange={(e) => setForm({ ...form, away_score: e.target.value })} /></div>
              <div className="space-y-2"><Label>Best of Frames</Label><Input type="number" value={form.best_of_frames} onChange={(e) => setForm({ ...form, best_of_frames: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3"><Switch checked={form.is_verified} onCheckedChange={(v) => setForm({ ...form, is_verified: v })} id="fx-verified" /><Label htmlFor="fx-verified">Verified result</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this fixture?" description="This will permanently remove the fixture and its individual matches. This cannot be undone." onConfirm={handleDelete} />
    </div>
  );
}
