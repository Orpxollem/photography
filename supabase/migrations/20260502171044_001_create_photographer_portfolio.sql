/*
  # Create photographer portfolio tables

  1. New Tables
    - `series` - Photography series/collections
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `quote` (text) - description or quote for the series
      - `image_url` (text) - cover image
      - `created_at` (timestamp)
    
    - `series_images` - Images within each series
      - `id` (uuid, primary key)
      - `series_id` (uuid, foreign key)
      - `image_url` (text)
      - `order` (integer)
      - `created_at` (timestamp)
    
    - `exhibitions` - Exhibition information
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `date` (date)
      - `image_url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - All tables publicly readable (photographer portfolio is public)
    - No insert/update/delete for public users
*/

CREATE TABLE IF NOT EXISTS series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  quote text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS series_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  date date,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Series are publicly readable"
  ON series FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Series images are publicly readable"
  ON series_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Exhibitions are publicly readable"
  ON exhibitions FOR SELECT
  TO public
  USING (true);

INSERT INTO series (title, description, quote, image_url) VALUES
('When I Was Your Age', 'The essence of shared memories, both lived and imagined.', 'The essence of shared memories, both lived and imagined.', 'https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg'),
('The Gate Series', 'A structure serving its purpose as security and having aesthetic qualities, becomes a backdrop for photographs.', 'A structure serving its purpose as security and having aesthetic qualities, becomes a backdrop for photographs.', 'https://images.pexels.com/photos/3875517/pexels-photo-3875517.jpeg'),
('Our Play Stations', 'Playfulness is often the nucleus of a thriving community.', 'Playfulness is often the nucleus of a thriving community.', 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg');

INSERT INTO exhibitions (title, description, location, date, image_url) VALUES
('Contemporary Photography 2024', 'A collection of works exploring memory and identity', 'New York Gallery', '2024-06-15', 'https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg'),
('Urban Narratives', 'Capturing life in metropolitan spaces', 'London Art Center', '2024-08-20', 'https://images.pexels.com/photos/3875517/pexels-photo-3875517.jpeg');
