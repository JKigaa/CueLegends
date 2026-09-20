import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/admin/empty-state';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Database } from 'lucide-react';
import type { PoolDiscipline } from '@/types/db';

interface AdminDisciplinesProps {
  navigate: (to: string) => void;
}

interface DisciplineFormData {
  name: string;
  slug: string;
  description: string;
  icon_emoji: string;
  sort_order: string;
}

const EMPTY_FORM: DisciplineFormData = { name: '', slug: '', description: '', icon_emoji: '🎱', sort_order: '0' };

export function AdminDisciplines({}: AdminDisciplinesProps) {
  const [disciplines, setDisciplines] = useState<PoolDiscipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DisciplineFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('pool_disciplines').select('*').order('sort_order');
    setDisciplines((data ?? []) as PoolDiscipline[]);
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setDialogOpen(true); };

  const openEdit = (d: PoolDiscipline) => {
    setForm({ name: d.name, slug: d.slug, description: d.description ?? '', icon_emoji: d.icon_emoji ?? '🎱', sort_order: d.sort_order.toString() });
    setEditingId(d.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim() || null,
      icon_emoji: form.icon_emoji.trim() || null,
      sort_order: parseInt(form.sort_order) || 0,
    };
    const { error } = editingId
      ? await supabase.from('pool_disciplines').update(payload).eq('id', editingId)
      : await supabase.from('pool_disciplines').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Discipline updated' : 'Discipline created');
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('pool_disciplines').delete().eq('id', deleteId);
    if (error) { toast.error(error.message); return; }
    toast.success('Discipline deleted');
    setDeleteId(null);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Disciplines</h1>
          <p className="mt-1 text-sm text-muted-foreground">{disciplines.length} pool disciplines</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add Discipline</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : disciplines.length === 0 ? (
        <EmptyState icon={Database} title="No disciplines found" description="Create your first pool discipline to get started." actionLabel="Add Discipline" onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {disciplines.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{d.icon_emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.slug} · Sort order: {d.sort_order}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(d.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Discipline' : 'Add New Discipline'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="8-Ball" /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="8-ball" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Icon Emoji</Label><Input value={form.icon_emoji} onChange={(e) => setForm({ ...form, icon_emoji: e.target.value })} placeholder="🎱" /></div>
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Discipline description..." rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete this discipline?" description="This will permanently remove the discipline. Clubs and players using it may lose their reference." onConfirm={handleDelete} />
    </div>
  );
}
