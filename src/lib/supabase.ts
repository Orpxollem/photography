import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Supabase client is used ONLY for image storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to upload images to Supabase storage
export async function uploadImage(file: File, bucket: string = 'photography'): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return publicUrl.publicUrl;
}

export type Series = {
  id: string;
  title: string;
  description: string | null;
  quote: string | null;
  image_url: string | null;
  created_at: string;
};

export type SeriesImage = {
  id: string;
  series_id: string;
  image_url: string;
  order: number;
  caption: string | null;
  created_at: string;
};

export type Exhibition = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  image_url: string | null;
  exhibition_type: 'solo' | 'group';
  created_at: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
};
