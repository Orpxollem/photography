import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Save, ChevronDown, ChevronUp, ImagePlus, Upload } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';
import type { Series as SeriesType, SeriesImage } from '../../lib/supabase';
import { ImageUpload } from '../../components/ImageUpload';
import { uploadImage } from '../../lib/supabase';
import { ConfirmDialog } from '../../components/ConfirmDialog';

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
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'series' | 'image' } | null>(null);

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

  const handleDelete = (id: string) => {
    setDeleteConfirm({ id, type: 'series' });
  };

  const handleDeleteImage = (imageId: string) => {
    setDeleteConfirm({ id: imageId, type: 'image' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === 'series') {
        await neonApi.deleteSeries(deleteConfirm.id);
        setSeriesList((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
        if (editingId === deleteConfirm.id) handleCancel();
      } else {
        await neonApi.deleteSeriesImage(deleteConfirm.id);
        fetchAll();
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async (seriesId: string, urlOverride?: string) => {
    const url = (urlOverride || newImageUrl[seriesId])?.trim();
    if (!url) return;
    
    const currentImages = seriesImages[seriesId] || [];
    if (currentImages.length >= 20) {
      alert('Maximum of 20 images allowed per series.');
      return;
    }

    setAddingImage(seriesId);
    try {
      const nextOrder = currentImages.length > 0 ? Math.max(...currentImages.map((i) => i.order)) + 1 : 0;
      await neonApi.createSeriesImage(seriesId, url, nextOrder);
      setNewImageUrl((prev) => ({ ...prev, [seriesId]: '' }));
      fetchAll();
    } catch (error) {
      console.error('Error adding image:', error);
    }
    setAddingImage(null);
  };

  const handleFileUpload = async (seriesId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentImages = seriesImages[seriesId] || [];
    if (currentImages.length >= 20) {
      alert('Maximum of 20 images allowed per series.');
      return;
    }

    setAddingImage(seriesId);
    try {
      const url = await uploadImage(file);
      await handleAddImage(seriesId, url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    } finally {
      setAddingImage(null);
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
          <div className="grid md:grid-cols-2 gap-8">
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
            </div>
            <div>
              <ImageUpload
                label="Cover Image"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-6">
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
      )}

      {/* Series List */}
      <div className="space-y-3">
        {seriesList.map((series) => {
          const isExpanded = expandedId === series.id;
          const images = seriesImages[series.id] || [];

          return (
            <div key={series.id} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {series.image_url && (
                    <img 
                      src={series.image_url} 
                      alt="" 
                      className="w-12 h-12 object-cover rounded bg-neutral-800"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-white font-light truncate">{series.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 truncate">
                      {series.quote || series.description || 'No description'}
                    </p>
                  </div>
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
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm text-gray-400">Gallery Images ({images.length}/20)</h4>
                    <label className={`flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white text-xs rounded-lg cursor-pointer hover:bg-neutral-700 transition ${images.length >= 20 ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload size={14} />
                      Upload File
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(series.id, e)}
                        disabled={addingImage === series.id}
                      />
                    </label>
                  </div>

                  {/* Add image input (manual URL) */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newImageUrl[series.id] || ''}
                      onChange={(e) => setNewImageUrl((prev) => ({ ...prev, [series.id]: e.target.value }))}
                      placeholder="Or paste an image URL..."
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 transition"
                    />
                    <button
                      onClick={() => handleAddImage(series.id)}
                      disabled={addingImage === series.id || !(newImageUrl[series.id]?.trim()) || images.length >= 20}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      {addingImage === series.id ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      Add
                    </button>
                  </div>

                  {/* Image list */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative group aspect-square bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                        <img
                          src={img.image_url}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReorderImage(img.id, series.id, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 disabled:opacity-30"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => handleReorderImage(img.id, series.id, 'down')}
                              disabled={idx === images.length - 1}
                              className="p-1.5 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 disabled:opacity-30"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="p-1.5 bg-red-900/80 rounded-full text-white hover:bg-red-800"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length === 0 && (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-neutral-800 rounded-lg text-gray-600 text-sm">
                        No images in this series yet.
                      </div>
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

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        loading={saving}
        title={deleteConfirm?.type === 'series' ? 'Delete Series' : 'Delete Image'}
        message={
          deleteConfirm?.type === 'series'
            ? 'Are you sure you want to delete this series? This will also remove all images within it. This action cannot be undone.'
            : 'Are you sure you want to remove this image from the gallery?'
        }
      />
    </div>
  );
}

