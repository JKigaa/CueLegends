import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, CircleDot } from 'lucide-react';
import type { Player, Country, Club, PoolDiscipline } from '@/types/db';

interface AdminPlayersProps {
  navigate: (to: string) => void;
}

interface PlayerFormData {
  name: string;
  slug: string;
  photo_url: string;
  cover_url: string;
  country_id: string;
  region: string;
  city: string;
  current_club_id: string;
  bio: string;
  primary_discipline_id: string;
  rating: string;
  is_active: boolean;
}

const EMPTY_FORM: PlayerFormData = {
  name: '', slug: '', photo_url: '', cover_url: '', country_id: 'none',
  region: '', city: '', current_club_id: 'none', bio: '', primary_discipline_id: 'none',
  rating: '0', is_active: true,
};

export function AdminPlayers({}: AdminPlayersProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlayerFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [playersRes, countriesRes, clubsRes, discRes] = await Promise.all([
      supabase.from('players').select(`*, country:countries(*), current_club:clubs(*), primary_discipline:pool_disciplines!players_primary_discipline_id_fkey(*)`).order('name'),
      supabase.from('countries').select('*').order('name'),
      supabase.from('clubs').select('*').order('name'),
      supabase.from('pool_disciplines').select('*').order('sort_order'),
    ]);
    setPlayers((playersRes.data ?? []) as Player[]);
    setCountries(countriesRes.data ?? []);
    setClubs(clubsRes.data ?? []);
    setDisciplines(discRes.data ?? []);
    setLoading(false);
  };

  const filtered = players.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.current_club?.name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };

  const openEdit = (p: Player) => {
    setForm({
      name: p.name, slug: p.slug, photo_url: p.photo_url ?? '', cover_url: p.cover_url ?? '',
      country_id: p.country_id ?? 'none', region: p.region ?? '', city: p.city ?? '',
      current_club_id: p.current_club_id ?? 'none', bio: p.bio ?? '',
      primary_discipline_id: p.primary_discipline_id ?? 'none',
      rating: p.rating.toString(), is_active: p.is_active,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      photo_url: form.photo_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      country_id: form.country_id === 'none' ? null : form.country_id,
      region: form.region.trim() || null,
      city: form.city.trim() || null,
      current_club_id: form.current_club_id === 'none' ? null : form.current_club_id,
      bio: form.bio.trim() || null,
      primary_discipline_id: form.primary_discipline_id === 'none' ? null : form.primary_discipline_id,
      rating: parseFloat(form.rating) || 0,
      is_active: form.is_active,
    };
    const { error } = editingId
      ? await supabase.from('players').update(payload).eq('id', editingId)
      : await supabase.from('players').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Player updated' : 'Player created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('players').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Player deleted');
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Players</h1>
          <p className="mt-1 text-sm text-muted-foreground">{players.length} players on the platform</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Player</Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CircleDot} title="No players found" description="Create your first player to get started." actionLabel="Add Player" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full felt-bg text-lg">🎱</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.name}</p>
                    {!p.is_active && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">Inactive</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.country?.flag_emoji} {p.current_club?.name ?? 'Free Agent'} · {p.ranking_points} pts · Rating {p.rating.toFixed(2)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Player' : 'Add New Player'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brian Otieno" /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="brian-otieno" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Country</Label><Select value={form.country_id} onValueChange={(v) => setForm({ ...form, country_id: v })}><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag_emoji} {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Current Club</Label><Select value={form.current_club_id} onValueChange={(v) => setForm({ ...form, current_club_id: v })}><SelectTrigger><SelectValue placeholder="Select club" /></SelectTrigger><SelectContent><SelectItem value="none">Free Agent</SelectItem>{clubs.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Primary Discipline</Label><Select value={form.primary_discipline_id} onValueChange={(v) => setForm({ ...form, primary_discipline_id: v })}><SelectTrigger><SelectValue placeholder="Select discipline" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.icon_emoji} {d.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Rating</Label><Input type="number" step="0.01" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="75.00" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Nairobi County" /></div>
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Nairobi" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Photo URL</Label><Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Cover URL</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." /></div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Player biography..." rows={3} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} id="player-active" /><Label htmlFor="player-active">Active</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this player?" description="This will permanently remove the player. This cannot be undone." onConfirm={handleDelete} />
    </div>
  );
}
