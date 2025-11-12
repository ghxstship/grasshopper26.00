# Supabase Storage Bucket Configuration

This document outlines the required Supabase Storage buckets for the GVTEWAY platform and their configuration.

## Required Buckets

The application requires the following storage buckets to be created in Supabase:

### 1. event-images
**Purpose:** Store event hero images and gallery images  
**Public Access:** Yes  
**File Size Limit:** 10MB  
**Allowed File Types:** image/jpeg, image/png, image/webp, image/gif

**Folder Structure:**
```
event-images/
  └── events/
      └── {event_id}/
          ├── hero-{timestamp}-{filename}
          └── gallery-{timestamp}-{filename}
```

**RLS Policies:**
- **INSERT:** Authenticated users with `can_manage_event()` permission
- **SELECT:** Public read access
- **UPDATE:** Authenticated users with `can_manage_event()` permission
- **DELETE:** Authenticated users with `can_manage_event()` permission

### 2. artist-images
**Purpose:** Store artist profile images  
**Public Access:** Yes  
**File Size Limit:** 10MB  
**Allowed File Types:** image/jpeg, image/png, image/webp, image/gif

**Folder Structure:**
```
artist-images/
  └── artists/
      └── {artist_id}/
          └── profile-{timestamp}-{filename}
```

**RLS Policies:**
- **INSERT:** Authenticated users with `can_manage_brand()` permission
- **SELECT:** Public read access
- **UPDATE:** Authenticated users with `can_manage_brand()` permission
- **DELETE:** Authenticated users with `can_manage_brand()` permission

### 3. product-images
**Purpose:** Store product and merchandise images  
**Public Access:** Yes  
**File Size Limit:** 10MB  
**Allowed File Types:** image/jpeg, image/png, image/webp, image/gif

**Folder Structure:**
```
product-images/
  └── products/
      └── {product_id}/
          └── {timestamp}-{filename}
```

**RLS Policies:**
- **INSERT:** Authenticated users with `can_manage_brand()` permission
- **SELECT:** Public read access
- **UPDATE:** Authenticated users with `can_manage_brand()` permission
- **DELETE:** Authenticated users with `can_manage_brand()` permission

### 4. avatars
**Purpose:** Store user profile avatars  
**Public Access:** Yes  
**File Size Limit:** 10MB  
**Allowed File Types:** image/jpeg, image/png, image/webp, image/gif

**Folder Structure:**
```
avatars/
  └── {user_id}/
      └── avatar-{timestamp}-{filename}
```

**RLS Policies:**
- **INSERT:** Authenticated users (own avatar only)
- **SELECT:** Public read access
- **UPDATE:** Authenticated users (own avatar only)
- **DELETE:** Authenticated users (own avatar only)

### 5. documents
**Purpose:** Store contracts, riders, and other documents  
**Public Access:** No (signed URLs only)  
**File Size Limit:** 10MB  
**Allowed File Types:** application/pdf

**Folder Structure:**
```
documents/
  ├── contracts/
  │   └── {timestamp}-{filename}
  ├── riders/
  │   └── {timestamp}-{filename}
  └── vendor-docs/
      └── {timestamp}-{filename}
```

**RLS Policies:**
- **INSERT:** Authenticated users with team member access
- **SELECT:** Authenticated users with appropriate permissions
- **UPDATE:** Authenticated users with team member access
- **DELETE:** Authenticated users with `is_super_admin()` permission

## Setup Instructions

### Via Supabase Dashboard

1. Navigate to **Storage** in your Supabase project dashboard
2. Click **New bucket** for each bucket listed above
3. Configure each bucket with the following settings:
   - **Bucket name:** Use exact names from list above
   - **Public bucket:** Set according to "Public Access" column
   - **File size limit:** 10485760 bytes (10MB)
   - **Allowed MIME types:** Set according to "Allowed File Types"

### Via SQL Migration

Alternatively, run the provided migration:

```bash
# Apply storage bucket configuration
psql $DATABASE_URL -f supabase/migrations/00059_storage_buckets.sql
```

### RLS Policy Setup

After creating buckets, apply RLS policies using the Supabase dashboard or SQL:

#### Example: event-images bucket policies

```sql
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

-- Allow public read access
CREATE POLICY "Public read access for event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Allow deletion by authorized users
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
```

## Verification

To verify storage is configured correctly:

1. **Test Upload:**
   ```bash
   curl -X POST https://your-project.supabase.co/storage/v1/object/event-images/test.jpg \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-image.jpg"
   ```

2. **Test Public Access:**
   ```bash
   curl https://your-project.supabase.co/storage/v1/object/public/event-images/test.jpg
   ```

3. **Check Bucket Policies:**
   - Navigate to Storage → Policies in Supabase dashboard
   - Verify all policies are listed and enabled

## Troubleshooting

### Upload Fails with 403 Forbidden
- Check RLS policies are correctly configured
- Verify user has appropriate permissions
- Check bucket is created and public access is set correctly

### Images Not Loading
- Verify bucket is set to public
- Check CORS configuration allows your domain
- Verify file path is correct

### File Size Errors
- Confirm file is under 10MB limit
- Check MIME type is in allowed list
- Verify file is not corrupted

## Environment Variables

Ensure the following environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Related Files

- Upload Service: `/src/lib/services/upload.service.ts`
- Event Image Upload API: `/src/app/api/admin/events/[id]/upload-image/route.ts`
- General Upload API: `/src/app/api/upload/route.ts`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Public Buckets:** Only event-images, artist-images, product-images, and avatars should be public
2. **Documents Bucket:** Must remain private, use signed URLs for access
3. **RLS Policies:** Always verify policies prevent unauthorized access
4. **File Validation:** Upload service validates file types and sizes server-side
5. **CORS:** Configure allowed origins in Supabase dashboard

## Next Steps

After setting up storage buckets:

1. Test image upload in event creation flow
2. Test avatar upload in user profile
3. Verify public access to uploaded images
4. Test document upload with signed URL access
5. Monitor storage usage in Supabase dashboard
