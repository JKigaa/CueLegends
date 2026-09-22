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
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import type { Ranking, Player, PoolDiscipline, Country } from '@/types/db';
import { CountryFlag } from '@/components/country-flag';

interface AdminRankingsProps {
  navigate: (to: string) => void;
}

interface RankingFormData {
  player_id: string;
  discipline_id: string;
  scope: string;
  country_id: string;
  rank_position: string;
  points: string;
  period: string;
}

const EMPTY_FORM: RankingFormData = {
  player_id: 'none', discipline_id: 'none', scope: 'global', country_id: 'none',
  rank_position: '', points: '0', period: 'all_time',
};

const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global' },
  { value: 'national', label: 'National' },
  { value: 'regional', label: 'Regional' },
];

const PERIOD_OPTIONS = [
  { value: 'all_time', label: 'All Time' },
  { value: '2026', label: '2026 Season' },
  { value: '2025', label: '2025 Season' },
];

export function AdminRankings({}: AdminRankingsProps) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RankingFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [rRes, pRes, dRes, cRes] = await Promise.all([
      supabase.from('rankings').select(`*, player:players!rankings_player_id_fkey(name), discipline:pool_disciplines!rankings_discipline_id_fkey(name, icon_emoji)`).order('rank_position', { ascending: true }),
      supabase.from('players').select('*').order('name'),
      supabase.from('pool_disciplines').select('*').order('sort_order'),
      supabase.from('countries').select('*').order('name'),
    ]);
    setRankings((rRes.data ?? []) as Ranking[]);
    setPlayers(pRes.data ?? []);
    setDisciplines(dRes.data ?? []);
    setCountries(cRes.data ?? []);
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };

  const openEdit = (r: Ranking) => {
    setForm({
      player_id: r.player_id,
      discipline_id: r.discipline_id ?? 'none',
      scope: r.scope,
      country_id: r.country_id ?? 'none',
      rank_position: r.rank_position?.toString() ?? '',
      points: r.points.toString(),
      period: r.period,
    });
    setEditingId(r.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.player_id === 'none') { toast.error('A player is required'); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      player_id: form.player_id,
      discipline_id: form.discipline_id === 'none' ? null : form.discipline_id,
      scope: form.scope,
      country_id: form.scope === 'global' ? null : (form.country_id === 'none' ? null : form.country_id),
      rank_position: form.rank_position ? parseInt(form.rank_position) : null,
      points: parseInt(form.points) || 0,
      period: form.period,
    };
    const { error } = editingId
      ? await supabase.from('rankings').update(payload).eq('id', editingId)
      : await supabase.from('rankings').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Ranking updated' : 'Ranking created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('rankings').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Ranking deleted');
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Rankings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rankings.length} ranking entries</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Ranking</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : rankings.length === 0 ? (
        <EmptyState icon={Trophy} title="No rankings found" description="Create your first ranking entry to get started." actionLabel="Add Ranking" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {rankings.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
                  {r.rank_position ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.player?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {r.discipline?.icon_emoji} {r.discipline?.name ?? 'All'} · {r.scope} · {r.points} pts · {r.period.replace('_', ' ')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Ranking' : 'Add New Ranking'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Player *</Label><Select value={form.player_id} onValueChange={(v) => setForm({ ...form, player_id: v })}><SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger><SelectContent>{players.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Discipline</Label><Select value={form.discipline_id} onValueChange={(v) => setForm({ ...form, discipline_id: v })}><SelectTrigger><SelectValue placeholder="Select discipline" /></SelectTrigger><SelectContent><SelectItem value="none">All Disciplines</SelectItem>{disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.icon_emoji} {d.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Scope</Label><Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SCOPE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
           {form.scope !== 'global' && (
  <div className="space-y-2">
    <Label>Country</Label>
    <Select
      value={form.country_id}
      onValueChange={(v) => setForm({ ...form, country_id: v })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select country">
          {(() => {
            const country = countries.find((c) => c.id === form.country_id);
            return country ? (
              <>
                <CountryFlag
                  isoCode={country.iso_code}
                  width={20}
                  height={14}
                  className="mr-2 inline-block"
                />
                {country.name}
              </>
            ) : null;
          })()}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="none">None</SelectItem>

        {countries.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <CountryFlag
              isoCode={c.iso_code}
              width={20}
              height={14}
              className="mr-2 inline-block"
            />
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Rank Position</Label><Input type="number" value={form.rank_position} onChange={(e) => setForm({ ...form, rank_position: e.target.value })} placeholder="1" /></div>
              <div className="space-y-2"><Label>Points</Label><Input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} /></div>
              <div className="space-y-2"><Label>Period</Label><Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PERIOD_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this ranking?" description="This will permanently remove the ranking entry. This cannot be undone." onConfirm={handleDelete} />
    </div>
  );
}
