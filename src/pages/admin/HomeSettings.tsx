import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';
import { ImageUpload } from '../../components/ImageUpload';
import { RichTextEditor } from '../../components/RichTextEditor';

export function AdminHomeSettings() {
  const [quote, setQuote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await neonApi.getSettings();
        data.forEach((row: any) => {
          if (row.key === 'home_quote') setQuote(row.value);
          if (row.key === 'home_image') setImageUrl(row.value);
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
      await neonApi.setSetting('home_quote', quote);
      await neonApi.setSetting('home_image', imageUrl);
      setMessage({ type: 'success', text: 'Home page updated successfully.' });
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
      <h2 className="text-2xl font-light text-white mb-8">Home Page</h2>

      <div className="space-y-8 max-w-2xl">
        <RichTextEditor
          label="Hero Quote"
          value={quote}
          onChange={setQuote}
          placeholder="Enter the quote displayed on the home page"
          minHeight="100px"
        />

        <ImageUpload
          label="Hero Image"
          value={imageUrl}
          onChange={setImageUrl}
        />

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
