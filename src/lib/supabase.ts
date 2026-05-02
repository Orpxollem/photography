import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
};

export type Exhibition = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  image_url: string | null;
  created_at: string;
};
