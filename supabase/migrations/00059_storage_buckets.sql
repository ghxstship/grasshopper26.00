-- Migration: Storage Bucket Configuration
-- Description: Create and configure Supabase Storage buckets with RLS policies
-- Author: System
-- Date: 2025-01-15

-- Note: Buckets must be created via Supabase Dashboard or API first
-- This migration only sets up the RLS policies for the buckets

-- ============================================================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================================================

-- Event Images Bucket Policies
-- ============================================================================

-- Allow authenticated users to upload event images if they can manage the event
CREATE POLICY "Users can upload event images if authorized"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND can_manage_event(auth.uid(), id)
  )
);

-- Allow public read access to event images
CREATE POLICY "Public read access for event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Allow authorized users to update event images
CREATE POLICY "Users can update event images if authorized"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND can_manage_event(auth.uid(), id)
  )
);

-- Allow authorized users to delete event images
CREATE POLICY "Users can delete event images if authorized"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = 'events' AND
  EXISTS (
    SELECT 1 FROM events
    WHERE id::text = (storage.foldername(name))[2]
    AND can_manage_event(auth.uid(), id)
  )
);

-- Artist Images Bucket Policies
-- ============================================================================

-- Allow team members to upload artist images
CREATE POLICY "Team members can upload artist images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artist-images' AND
  is_team_member(auth.uid())
);

-- Allow public read access to artist images
CREATE POLICY "Public read access for artist images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artist-images');

-- Allow team members to update artist images
CREATE POLICY "Team members can update artist images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'artist-images' AND
  is_team_member(auth.uid())
);

-- Allow team members to delete artist images
CREATE POLICY "Team members can delete artist images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'artist-images' AND
  is_team_member(auth.uid())
);

-- Product Images Bucket Policies
-- ============================================================================

-- Allow team members to upload product images
CREATE POLICY "Team members can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  is_team_member(auth.uid())
);

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow team members to update product images
CREATE POLICY "Team members can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  is_team_member(auth.uid())
);

-- Allow team members to delete product images
CREATE POLICY "Team members can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  is_team_member(auth.uid())
);

-- Avatars Bucket Policies
-- ============================================================================

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents Bucket Policies (Private - Signed URLs only)
-- ============================================================================

-- Allow team members to upload documents
CREATE POLICY "Team members can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  is_team_member(auth.uid())
);

-- Allow team members to read documents
CREATE POLICY "Team members can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  is_team_member(auth.uid())
);

-- Allow team members to update documents
CREATE POLICY "Team members can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  is_team_member(auth.uid())
);

-- Allow super admins to delete documents
CREATE POLICY "Super admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  is_super_admin(auth.uid())
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can upload event images if authorized" ON storage.objects IS 
  'Allows authenticated users to upload images to events they can manage';

COMMENT ON POLICY "Public read access for event images" ON storage.objects IS 
  'Allows public access to view event images';

COMMENT ON POLICY "Team members can upload artist images" ON storage.objects IS 
  'Allows team members to upload artist profile images';

COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 
  'Allows users to upload and manage their own profile avatar';

COMMENT ON POLICY "Team members can upload documents" ON storage.objects IS 
  'Allows team members to upload contracts, riders, and other documents';
