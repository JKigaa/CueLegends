import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Globe } from 'lucide-react';
import type { Country } from '@/types/db';
import { CountryFlag } from '@/components/country-flag';

interface AdminCountriesProps {
  navigate: (to: string) => void;
}

interface CountryFormData {
  name: string;
  iso_code: string;
  flag_emoji: string;
}

const EMPTY_FORM: CountryFormData = { name: '', iso_code: '', flag_emoji: '' };

export function AdminCountries({}: AdminCountriesProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CountryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('countries').select('*').order('name');
    setCountries((data ?? []) as Country[]);
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };

  const openEdit = (c: Country) => {
    setForm({ name: c.name, iso_code: c.iso_code, flag_emoji: c.flag_emoji ?? '' });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.iso_code.trim()) { toast.error('Name and ISO code are required'); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name.trim(),
      iso_code: form.iso_code.trim().toUpperCase(),
      flag_emoji: form.flag_emoji.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from('countries').update(payload).eq('id', editingId)
      : await supabase.from('countries').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Country updated' : 'Country created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('countries').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Country deleted');
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Countries</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countries.length} countries registered</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Country</Button>
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : countries.length === 0 ? (
        <EmptyState icon={Globe} title="No countries found" description="Add your first country to get started." actionLabel="Add Country" onAction={openCreate} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <CountryFlag
  isoCode={c.iso_code}
  width={32}
  height={22}
  className="flex-shrink-0 rounded-sm"
/>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.iso_code}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Country' : 'Add New Country'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kenya" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>ISO Code *</Label><Input value={form.iso_code} onChange={(e) => setForm({ ...form, iso_code: e.target.value })} placeholder="KE" maxLength={3} /></div>
              <div className="space-y-2"><Label>Flag Emoji</Label><Input value={form.flag_emoji} onChange={(e) => setForm({ ...form, flag_emoji: e.target.value })} placeholder="🇰🇪" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this country?" description="This will permanently remove the country. Clubs and players using it will lose their reference." onConfirm={handleDelete} />
    </div>
  );
}
