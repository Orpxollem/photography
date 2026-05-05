-- Create the photography bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photography', 'photography', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the photography bucket
-- 1. Allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photography');

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photography');

-- 3. Allow authenticated users to update their own files
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photography');

-- 4. Allow authenticated users to delete files
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photography');
