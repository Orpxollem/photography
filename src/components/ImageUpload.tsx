import React, { useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { uploadImage } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm text-gray-400">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video w-full max-w-sm rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/50 cursor-pointer hover:border-neutral-500 hover:bg-neutral-900 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2 className="animate-spin text-gray-500 mb-2" size={24} />
              ) : (
                <Upload className="text-gray-500 mb-2" size={24} />
              )}
              <p className="text-sm text-gray-400">
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL..."
          className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-neutral-500 transition"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
