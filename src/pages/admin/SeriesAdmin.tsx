import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Save, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';
import type { Series as SeriesType, SeriesImage } from '../../lib/supabase';

interface SeriesForm {
  title: string;
  description: string;
  quote: string;
  image_url: string;
}

const emptyForm: SeriesForm = {
  title: '',
  description: '',
  quote: '',
  image_url: '',
};

export function AdminSeries() {
  const [seriesList, setSeriesList] = useState<SeriesType[]>([]);
  const [seriesImages, setSeriesImages] = useState<Record<string, SeriesImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<SeriesForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<Record<string, string>>({});
  const [addingImage, setAddingImage] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const seriesData = await neonApi.getSeries();
      setSeriesList(seriesData);
      const imagesMap: Record<string, SeriesImage[]> = {};
      for (const s of seriesData) {
        const imgs = await neonApi.getSeriesImages(s.id);
        imagesMap[s.id] = imgs || [];
      }
      setSeriesImages(imagesMap);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleEdit = (series: SeriesType) => {
    setEditingId(series.id);
    setIsCreating(false);
    setForm({
      title: series.title,
      description: series.description || '',
      quote: series.quote || '',
      image_url: series.image_url || '',
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
        await neonApi.createSeries({
          title: form.title,
          description: form.description || undefined,
          quote: form.quote || undefined,
          image_url: form.image_url || undefined,
        });
        setMessage({ type: 'success', text: 'Series created.' });
        handleCancel();
        fetchAll();
      } else if (editingId) {
        await neonApi.updateSeries(editingId, {
          title: form.title,
          description: form.description || undefined,
          quote: form.quote || undefined,
          image_url: form.image_url || undefined,
        });
        setMessage({ type: 'success', text: 'Series updated.' });
        handleCancel();
        fetchAll();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save series.' });
      console.error('Error:', error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this series and all its images?')) return;
    try {
      await neonApi.deleteSeries(id);
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) handleCancel();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleAddImage = async (seriesId: string) => {
    const url = newImageUrl[seriesId]?.trim();
    if (!url) return;
    setAddingImage(seriesId);
    try {
      const currentImages = seriesImages[seriesId] || [];
      const nextOrder = currentImages.length > 0 ? Math.max(...currentImages.map((i) => i.order)) + 1 : 0;
      await neonApi.createSeriesImage(seriesId, url, nextOrder);
      setNewImageUrl((prev) => ({ ...prev, [seriesId]: '' }));
      fetchAll();
    } catch (error) {
      console.error('Error adding image:', error);
    }
    setAddingImage(null);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await neonApi.deleteSeriesImage(imageId);
      fetchAll();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleReorderImage = async (imageId: string, seriesId: string, direction: 'up' | 'down') => {
    const images = seriesImages[seriesId] || [];
    const idx = images.findIndex((i) => i.id === imageId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;

    const a = images[idx];
    const b = images[swapIdx];

    try {
      await neonApi.reorderSeriesImage(a.id, b.order);
      await neonApi.reorderSeriesImage(b.id, a.order);
      fetchAll();
    } catch (error) {
      console.error('Error reordering:', error);
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
        <h2 className="text-2xl font-light text-white">Series</h2>
        {!isEditing && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition"
          >
            <Plus size={16} />
            Add Series
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
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg text-white">{isCreating ? 'New Series' : 'Edit Series'}</h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
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
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Quote</label>
              <textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Cover Image URL</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-neutral-500 transition"
              />
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

      {/* Series List */}
      <div className="space-y-3">
        {seriesList.map((series) => {
          const isExpanded = expandedId === series.id;
          const images = seriesImages[series.id] || [];

          return (
            <div key={series.id} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-light truncate">{series.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 truncate">
                    {series.quote || series.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : series.id)}
                    className="p-2 text-gray-500 hover:text-white transition"
                    title="Manage images"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(series)}
                    className="p-2 text-gray-500 hover:text-white transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(series.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded: Image management */}
              {isExpanded && (
                <div className="border-t border-neutral-800 p-4">
                  <h4 className="text-sm text-gray-400 mb-3">Gallery Images ({images.length})</h4>

                  {/* Add image input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newImageUrl[series.id] || ''}
                      onChange={(e) => setNewImageUrl((prev) => ({ ...prev, [series.id]: e.target.value }))}
                      placeholder="Image URL"
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition"
                    />
                    <button
                      onClick={() => handleAddImage(series.id)}
                      disabled={addingImage === series.id || !(newImageUrl[series.id]?.trim())}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600 transition disabled:opacity-50"
                    >
                      {addingImage === series.id ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      Add
                    </button>
                  </div>

                  {/* Image list */}
                  <div className="space-y-2">
                    {images.map((img, idx) => (
                      <div key={img.id} className="flex items-center gap-3 p-2 bg-neutral-800 rounded-lg">
                        <img
                          src={img.image_url}
                          alt={`Image ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded border border-neutral-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <span className="flex-1 text-sm text-gray-300 truncate">{img.image_url}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorderImage(img.id, series.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-500 hover:text-white transition disabled:opacity-30"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleReorderImage(img.id, series.id, 'down')}
                            disabled={idx === images.length - 1}
                            className="p-1 text-gray-500 hover:text-white transition disabled:opacity-30"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition ml-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length === 0 && (
                      <p className="text-gray-600 text-sm py-4 text-center">No images in this series yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {seriesList.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">No series yet.</p>
        )}
      </div>
    </div>
  );
}
