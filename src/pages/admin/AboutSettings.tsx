import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';

export function AdminAboutSettings() {
  const [image, setImage] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await neonApi.getSettings();
        data.forEach((row: any) => {
          if (row.key === 'about_image') setImage(row.value);
          if (row.key === 'about_bio') setBio(row.value);
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await neonApi.setSetting('about_image', image);
      await neonApi.setSetting('about_bio', bio);
      setMessage({ type: 'success', text: 'About page updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes.' });
      console.error('Error:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-light text-white mb-8">About Page</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Portrait Image URL</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neutral-500 transition"
            placeholder="https://images.pexels.com/..."
          />
          {image && (
            <div className="mt-3">
              <img
                src={image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-neutral-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neutral-500 transition resize-none"
            placeholder="Enter the biography text for the about page"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
