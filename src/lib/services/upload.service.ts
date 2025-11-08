import { createClient } from '@/lib/supabase/server';
import { ErrorResponses } from '@/lib/api/error-handler';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

export class UploadService {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  async uploadEventImage(
    file: File,
    eventId: string,
    type: 'hero' | 'gallery'
  ): Promise<string> {
    this.validateImageFile(file);

    const fileName = `events/${eventId}/${type}-${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('event-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to upload image', error);
    }

    const { data: urlData } = this.supabase.storage
      .from('event-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadArtistImage(file: File, artistId: string): Promise<string> {
    this.validateImageFile(file);

    const fileName = `artists/${artistId}/profile-${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('artist-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to upload image', error);
    }

    const { data: urlData } = this.supabase.storage
      .from('artist-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadProductImage(file: File, productId: string): Promise<string> {
    this.validateImageFile(file);

    const fileName = `products/${productId}/${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to upload image', error);
    }

    const { data: urlData } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    this.validateImageFile(file);

    const fileName = `avatars/${userId}/avatar-${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Allow overwriting
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to upload avatar', error);
    }

    const { data: urlData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async uploadDocument(file: File, folder: string): Promise<string> {
    this.validateDocumentFile(file);

    const fileName = `${folder}/${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw ErrorResponses.databaseError('Failed to upload document', error);
    }

    const { data: urlData } = this.supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw ErrorResponses.databaseError('Failed to delete file', error);
    }
  }

  async listFiles(bucket: string, folder: string): Promise<any[]> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      throw ErrorResponses.databaseError('Failed to list files', error);
    }

    return data || [];
  }

  private validateImageFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw ErrorResponses.fileTooLarge(MAX_FILE_SIZE);
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw ErrorResponses.invalidFileType(ALLOWED_IMAGE_TYPES);
    }
  }

  private validateDocumentFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw ErrorResponses.fileTooLarge(MAX_FILE_SIZE);
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      throw ErrorResponses.invalidFileType(ALLOWED_DOCUMENT_TYPES);
    }
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw ErrorResponses.databaseError('Failed to create signed URL', error);
    }

    return data.signedUrl;
  }
}
