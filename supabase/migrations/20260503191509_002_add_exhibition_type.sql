/*
  # Add exhibition type column

  1. Modified Tables
    - `exhibitions`
      - Added `exhibition_type` (text) - categorizes exhibitions as 'solo' or 'group'
      - Default value: 'solo'

  2. Data Updates
    - Updated existing exhibitions with types for demonstration

  3. Security
    - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exhibitions' AND column_name = 'exhibition_type'
  ) THEN
    ALTER TABLE exhibitions ADD COLUMN exhibition_type text NOT NULL DEFAULT 'solo';
  END IF;
END $$;

-- Update existing data to have variety
UPDATE exhibitions SET exhibition_type = 'solo' WHERE title = 'Contemporary Photography 2024';
UPDATE exhibitions SET exhibition_type = 'group' WHERE title = 'Urban Narratives';

-- Add more exhibition data for better demonstration
INSERT INTO exhibitions (title, description, location, date, image_url, exhibition_type) VALUES
('Fragments of Home', 'Exploring displacement and belonging through portraiture', 'Accra Art Space, Accra', '2024-03-10', 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg', 'solo'),
('West African Lens', 'Group show featuring West African photographers', 'Lagos Photo Festival, Lagos', '2024-11-01', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg', 'group'),
('Memory & Motion', 'Solo exhibition on movement and cultural memory', 'Kumasi Cultural Centre, Kumasi', '2023-09-15', 'https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg', 'solo'),
('Collective Visions', 'A curated group exhibition of emerging African photographers', 'Zeitz MOCAA, Cape Town', '2023-12-05', 'https://images.pexels.com/photos/3875517/pexels-photo-3875517.jpeg', 'group');
