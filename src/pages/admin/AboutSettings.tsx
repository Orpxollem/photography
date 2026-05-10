import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import * as neonApi from '../../lib/neonApi';
import { ImageUpload } from '../../components/ImageUpload';
import { RichTextEditor } from '../../components/RichTextEditor';

export function AdminAboutSettings() {
  const [image, setImage] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
          if (row.key === 'about_instagram') setInstagram(row.value);
          if (row.key === 'about_email') setEmail(row.value);
          if (row.key === 'about_phone') setPhone(row.value);
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
      await Promise.all([
        neonApi.setSetting('about_image', image),
        neonApi.setSetting('about_bio', bio),
        neonApi.setSetting('about_instagram', instagram),
        neonApi.setSetting('about_email', email),
        neonApi.setSetting('about_phone', phone),
      ]);
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

      <div className="space-y-8 max-w-2xl">
        <ImageUpload
          label="Portrait Image"
          value={image}
          onChange={setImage}
        />

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Contact Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Instagram URL</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://www.instagram.com/username"
                className="w-full px-4 py-2.5 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 ..."
                className="w-full px-4 py-2.5 bg-[#111] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        <RichTextEditor
          label="Biography"
          value={bio}
          onChange={setBio}
          placeholder="Enter the biography text for the about page"
          minHeight="260px"
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
