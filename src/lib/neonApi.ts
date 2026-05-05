import { supabase } from './supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neon-api`;

interface QueryOptions {
  action: string;
  [key: string]: any;
}

export async function callNeonApi(options: QueryOptions) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

// Series operations
export async function getSeries() {
  return callNeonApi({ action: 'getSeries' });
}

export async function getSeriesById(id: string) {
  return callNeonApi({ action: 'getSeriesById', id });
}

export async function getSeriesImages(seriesId: string) {
  return callNeonApi({ action: 'getSeriesImages', series_id: seriesId });
}

export async function createSeries(data: { title: string; description?: string; quote?: string; image_url?: string }) {
  return callNeonApi({
    action: 'createSeries',
    ...data,
  });
}

export async function updateSeries(id: string, data: { title: string; description?: string; quote?: string; image_url?: string }) {
  return callNeonApi({
    action: 'updateSeries',
    id,
    ...data,
  });
}

export async function deleteSeries(id: string) {
  return callNeonApi({ action: 'deleteSeries', id });
}

export async function createSeriesImage(seriesId: string, imageUrl: string, order: number) {
  return callNeonApi({
    action: 'createSeriesImage',
    series_id: seriesId,
    image_url: imageUrl,
    order,
  });
}

export async function deleteSeriesImage(id: string) {
  return callNeonApi({ action: 'deleteSeriesImage', id });
}

export async function reorderSeriesImage(id: string, order: number) {
  return callNeonApi({
    action: 'reorderSeriesImage',
    id,
    order,
  });
}

// Exhibition operations
export async function getExhibitions() {
  return callNeonApi({ action: 'getExhibitions' });
}

export async function createExhibition(data: {
  title: string;
  description?: string;
  location?: string;
  date?: string;
  image_url?: string;
  exhibition_type?: 'solo' | 'group';
}) {
  return callNeonApi({
    action: 'createExhibition',
    ...data,
  });
}

export async function updateExhibition(id: string, data: {
  title: string;
  description?: string;
  location?: string;
  date?: string;
  image_url?: string;
  exhibition_type?: 'solo' | 'group';
}) {
  return callNeonApi({
    action: 'updateExhibition',
    id,
    ...data,
  });
}

export async function deleteExhibition(id: string) {
  return callNeonApi({ action: 'deleteExhibition', id });
}

// Settings operations
export async function getSettings() {
  return callNeonApi({ action: 'getSettings' });
}

export async function getSetting(key: string) {
  return callNeonApi({ action: 'getSetting', key });
}

export async function setSetting(key: string, value: string) {
  return callNeonApi({
    action: 'setSetting',
    key,
    value,
  });
}
