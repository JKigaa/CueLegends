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
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import type { Club, Country, PoolDiscipline } from '@/types/db';

interface AdminClubsProps {
  navigate: (to: string) => void;
}

interface ClubFormData {
  name: string;
  slug: string;
  short_name: string;
  logo_url: string;
  cover_url: string;
  country_id: string;
  region: string;
  city: string;
  venue_name: string;
  venue_address: string;
  founded_year: string;
  description: string;
  primary_discipline_id: string;
  is_active: boolean;
}

const EMPTY_FORM: ClubFormData = {
  name: '', slug: '', short_name: '', logo_url: '', cover_url: '', country_id: 'none',
  region: '', city: '', venue_name: '', venue_address: '', founded_year: '', description: '',
  primary_discipline_id: 'none', is_active: true,
};

export function AdminClubs({}: AdminClubsProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClubFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [clubsRes, countriesRes, discRes] = await Promise.all([
      supabase.from('clubs').select(`*, country:countries(*), primary_discipline:pool_disciplines!clubs_primary_discipline_id_fkey(*)`).order('name'),
      supabase.from('countries').select('*').order('name'),
      supabase.from('pool_disciplines').select('*').order('sort_order'),
    ]);
    setClubs((clubsRes.data ?? []) as Club[]);
    setCountries(countriesRes.data ?? []);
    setDisciplines(discRes.data ?? []);
    setLoading(false);
  };

  const filtered = clubs.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.city?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (club: Club) => {
    setForm({
      name: club.name,
      slug: club.slug,
      short_name: club.short_name ?? '',
      logo_url: club.logo_url ?? '',
      cover_url: club.cover_url ?? '',
      country_id: club.country_id ?? 'none',
      region: club.region ?? '',
      city: club.city ?? '',
      venue_name: club.venue_name ?? '',
      venue_address: club.venue_address ?? '',
      founded_year: club.founded_year?.toString() ?? '',
      description: club.description ?? '',
      primary_discipline_id: club.primary_discipline_id ?? 'none',
      is_active: club.is_active,
    });
    setEditingId(club.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      short_name: form.short_name.trim() || null,
      logo_url: form.logo_url.trim() || null,
      cover_url: form.cover_url.trim() || null,
      country_id: form.country_id === 'none' ? null : form.country_id,
      region: form.region.trim() || null,
      city: form.city.trim() || null,
      venue_name: form.venue_name.trim() || null,
      venue_address: form.venue_address.trim() || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      description: form.description.trim() || null,
      primary_discipline_id: form.primary_discipline_id === 'none' ? null : form.primary_discipline_id,
      is_active: form.is_active,
    };

    const { error } = editingId
      ? await supabase.from('clubs').update(payload).eq('id', editingId)
      : await supabase.from('clubs').insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? 'Club updated' : 'Club created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('clubs').delete().eq('id', deleteId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Club deleted');
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Clubs</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clubs.length} clubs on the platform</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Club
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clubs..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No clubs found" description="Create your first club to get started." actionLabel="Add Club" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {filtered.map((club) => (
            <Card key={club.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg felt-bg text-lg">🎱</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{club.name}</p>
                    {!club.is_active && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">Inactive</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {club.country?.flag_emoji} {club.city ?? 'No city'} · {club.ranking_points} pts · {club.total_matches} matches
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(club)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(club.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Club' : 'Add New Club'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nairobi Sharks" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="nairobi-sharks" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} placeholder="NSH" />
              </div>
              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input type="number" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} placeholder="2018" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={form.country_id} onValueChange={(v) => setForm({ ...form, country_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.flag_emoji} {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Discipline</Label>
                <Select value={form.primary_discipline_id} onValueChange={(v) => setForm({ ...form, primary_discipline_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select discipline" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.icon_emoji} {d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Nairobi County" />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Nairobi" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} placeholder="Shark Pool Hall" />
              </div>
              <div className="space-y-2">
                <Label>Venue Address</Label>
                <Input value={form.venue_address} onChange={(e) => setForm({ ...form, venue_address: e.target.value })} placeholder="123 Moi Avenue" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Cover URL</Label>
                <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Club description..." rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} id="club-active" />
              <Label htmlFor="club-active">Active (visible on public site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete this club?"
        description="This will permanently remove the club and its related data. This cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}
