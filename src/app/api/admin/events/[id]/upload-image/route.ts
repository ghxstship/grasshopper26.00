import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UploadService } from '@/lib/services/upload.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'hero' | 'gallery';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['hero', 'gallery'].includes(type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }

    const uploadService = new UploadService(supabase);
    const imageUrl = await uploadService.uploadEventImage(file, id, type);

    // Update event with image URL
    if (type === 'hero') {
      const { error: updateError } = await supabase
        .from('events')
        .update({ hero_image: imageUrl })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // For gallery images, append to existing gallery array
      const { data: event } = await supabase
        .from('events')
        .select('gallery_images')
        .eq('id', id)
        .single();

      const galleryImages = event?.gallery_images || [];
      galleryImages.push(imageUrl);

      const { error: updateError } = await supabase
        .from('events')
        .update({ gallery_images: galleryImages })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
