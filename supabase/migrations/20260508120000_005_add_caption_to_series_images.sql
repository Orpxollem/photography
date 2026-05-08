-- Add caption column to series_images
ALTER TABLE series_images ADD COLUMN IF NOT EXISTS caption TEXT;
