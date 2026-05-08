import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Save } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';
import type { Exhibition } from '../../lib/supabase';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { RichTextEditor } from '../../components/RichTextEditor';

interface ExhibitionForm {
  title: string;
  description: string;
  location: string;
  date: string;
  exhibition_type: 'solo' | 'group';
}

const emptyForm: ExhibitionForm = {
  title: '',
  description: '',
  location: '',
  date: '',
  exhibition_type: 'solo',
};

export function AdminExhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<ExhibitionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExhibitions = async () => {
    try {
      const data = await neonApi.getExhibitions();
      setExhibitions(data || []);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchExhibitions(); }, []);

  const handleEdit = (exhibition: Exhibition) => {
    setEditingId(exhibition.id);
    setIsCreating(false);
    setForm({
      title: exhibition.title,
      description: exhibition.description || '',
      location: exhibition.location || '',
      date: exhibition.date || '',
      exhibition_type: exhibition.exhibition_type,
    });
  };

  const handleNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (isCreating) {
        await neonApi.createExhibition({
          title: form.title,
          description: form.description || undefined,
          location: form.location || undefined,
          date: form.date || undefined,
          exhibition_type: form.exhibition_type,
        });
        setMessage({ type: 'success', text: 'Exhibition created.' });
        handleCancel();
        fetchExhibitions();
      } else if (editingId) {
        await neonApi.updateExhibition(editingId, {
          title: form.title,
          description: form.description || undefined,
          location: form.location || undefined,
          date: form.date || undefined,
          exhibition_type: form.exhibition_type,
        });
        setMessage({ type: 'success', text: 'Exhibition updated.' });
        handleCancel();
        fetchExhibitions();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save exhibition.' });
      console.error('Error:', error);
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await neonApi.deleteExhibition(deleteId);
      setExhibitions((prev) => prev.filter((e) => e.id !== deleteId));
      if (editingId === deleteId) handleCancel();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = isCreating || editingId !== null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-light text-white">Exhibitions</h2>
        {!isEditing && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition"
          >
            <Plus size={16} />
            Add Exhibition
          </button>
        )}
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      {/* Edit/Create Form */}
      {isEditing && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-8 max-sm:p-4 max-sm:mb-6">
          <div className="flex items-center justify-between mb-6 max-sm:mb-4">
            <h3 className="text-lg text-white">{isCreating ? 'New Exhibition' : 'Edit Exhibition'}</h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Type</label>
                <select
                  value={form.exhibition_type}
                  onChange={(e) => setForm({ ...form, exhibition_type: e.target.value as 'solo' | 'group' })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition"
                >
                  <option value="solo">Solo</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>
            <RichTextEditor
              label="Description"
              value={form.description}
              onChange={(val) => setForm({ ...form, description: val })}
              placeholder="Exhibition description"
              minHeight="80px"
            />
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.title}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isCreating ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exhibition List */}
      <div className="space-y-3">
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.id}
            className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg group hover:border-neutral-700 transition"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-light truncate">{exhibition.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  exhibition.exhibition_type === 'solo'
                    ? 'bg-amber-900/40 text-amber-300'
                    : 'bg-teal-900/40 text-teal-300'
                }`}>
                  {exhibition.exhibition_type}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1 truncate">
                {exhibition.location}{exhibition.location && exhibition.date ? ' - ' : ''}
                {exhibition.date ? new Date(exhibition.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleEdit(exhibition)}
                className="p-2 text-gray-500 hover:text-white transition"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(exhibition.id)}
                className="p-2 text-gray-500 hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {exhibitions.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">No exhibitions yet.</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={saving}
        title="Delete Exhibition"
        message="Are you sure you want to delete this exhibition? This action cannot be undone."
      />
    </div>
  );
}
