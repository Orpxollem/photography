/*
  # Add site settings table and admin write policies

  1. New Tables
    - `site_settings` - Key-value store for site-wide configurable content
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting identifier (e.g. 'home_quote', 'home_image', 'about_image', 'about_bio')
      - `value` (text) - the setting value (URL, text, etc.)
      - `updated_at` (timestamp)

  2. Data Updates
    - Seed site_settings with current hardcoded values from the site:
      - home_quote: the quote from the home page
      - home_image: the hero image URL
      - about_image: the about page portrait
      - about_bio: the about page biography text

  3. Security
    - Enable RLS on site_settings
    - Public SELECT policy (anyone can read settings)
    - Authenticated INSERT/UPDATE/DELETE policy (admin users can modify)
    - Add authenticated write policies for series, series_images, and exhibitions tables
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (true);

-- Seed with current site content
INSERT INTO site_settings (key, value) VALUES
  ('home_quote', 'Aside your two binocular eyes and the camera''s monocular lens, you need a fourth eye as a photographer'),
  ('home_image', 'https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg'),
  ('about_image', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg'),
  ('about_bio', 'Joel Gyamera (b. 1999, Tema, Ghana) is a photographer whose work transforms personal memory and everyday environments into visual narratives of connection. Originally entering the creative space as a model, Joel developed a distinct sensitivity to posture and presence, qualities that inform his emotionally resonant photographic style.\n\nHe developed his narrative approach through close engagement with artists, whose dialogue and guidance helped shape his photographic language.\n\nHis work foregrounds motion, texture, and community as sites of creative inquiry. Rooted in personal experience and cultural memory, Joel''s photography offers a poetic lens into resilience, joy, and collective identity, bridging the past and present through visual storytelling.');

-- Add write policies for existing tables (for admin use)
CREATE POLICY "Authenticated users can insert series"
  ON series FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update series"
  ON series FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete series"
  ON series FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert series images"
  ON series_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update series images"
  ON series_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete series images"
  ON series_images FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert exhibitions"
  ON exhibitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update exhibitions"
  ON exhibitions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete exhibitions"
  ON exhibitions FOR DELETE
  TO authenticated
  USING (true);
