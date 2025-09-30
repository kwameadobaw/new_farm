/*
  # Setup Storage Bucket for Farm Visit Photos

  ## Overview
  Creates a storage bucket for farm visit photos with public access.

  ## New Storage Bucket
  - `farm-visits` - Stores farm visit photos and documents
    - Public access enabled for easy retrieval
    - No file size restrictions for flexibility

  ## Storage Policies
  - Anyone can upload files (for field officers)
  - Anyone can read files (for viewing photos)
  - Authenticated users can delete files (for admin management)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('farm-visits', 'farm-visits', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload farm visit files"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'farm-visits');

CREATE POLICY "Anyone can view farm visit files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'farm-visits');

CREATE POLICY "Authenticated users can delete farm visit files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'farm-visits');