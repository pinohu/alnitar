/**
 * Storage Abstraction Layer
 * 
 * Provides a portable interface for file/image storage.
 * Current adapter: Supabase Storage (via Lovable Cloud)
 * Future adapters: Cloudflare R2, AWS S3, etc.
 * 
 * Storage paths follow the pattern:
 *   uploads/{userId}/{observationId}/original.jpg
 *   uploads/{userId}/{observationId}/annotated.jpg
 *   sharecards/{userId}/{shareCardId}.png
 */

import { supabase } from "@/integrations/supabase/client";

export interface StorageUploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface StorageAdapter {
  upload(bucket: string, path: string, file: File | Blob, contentType?: string): Promise<StorageUploadResult>;
  getPublicUrl(bucket: string, path: string): string;
  remove(bucket: string, path: string): Promise<{ error?: string }>;
  list(bucket: string, prefix: string): Promise<{ files: string[]; error?: string }>;
}

// ─── Supabase Storage Adapter ────────────────────────────────

class SupabaseStorageAdapter implements StorageAdapter {
  async upload(bucket: string, path: string, file: File | Blob, contentType?: string): Promise<StorageUploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) return { url: "", path: "", error: error.message };

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl, path: data.path };
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async remove(bucket: string, path: string): Promise<{ error?: string }> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return { error: error?.message };
  }

  async list(bucket: string, prefix: string): Promise<{ files: string[]; error?: string }> {
    const { data, error } = await supabase.storage.from(bucket).list(prefix);
    return { files: data?.map(f => f.name) || [], error: error?.message };
  }
}

// ─── Local/Memory Fallback (for dev or when storage isn't configured) ───

class LocalStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  async upload(_bucket: string, path: string, file: File | Blob): Promise<StorageUploadResult> {
    const url = URL.createObjectURL(file);
    this.store.set(path, url);
    return { url, path };
  }

  getPublicUrl(_bucket: string, path: string): string {
    return this.store.get(path) || "";
  }

  async remove(_bucket: string, path: string): Promise<{ error?: string }> {
    this.store.delete(path);
    return {};
  }

  async list(_bucket: string, prefix: string): Promise<{ files: string[]; error?: string }> {
    const files = Array.from(this.store.keys()).filter(k => k.startsWith(prefix));
    return { files };
  }
}

// ─── Export ──────────────────────────────────────────────────

// Use Supabase when available, local fallback otherwise
export const storage: StorageAdapter = new SupabaseStorageAdapter();
export const localStore: StorageAdapter = new LocalStorageAdapter();

// Helper: generate structured storage paths
export function storagePath(type: "upload" | "annotated" | "sharecard", userId: string, objectId: string, ext = "jpg") {
  switch (type) {
    case "upload": return `uploads/${userId}/${objectId}/original.${ext}`;
    case "annotated": return `uploads/${userId}/${objectId}/annotated.${ext}`;
    case "sharecard": return `sharecards/${userId}/${objectId}.${ext}`;
  }
}
