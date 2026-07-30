import { supabase } from "@/lib/supabase";

const BUCKET = "materi-images";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export class UploadImageError extends Error {}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "png";
}

function generateUniqueFileName(originalName: string): string {
  const ext = getFileExtension(originalName);
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${uniqueId}.${ext}`;
}

function validateImageFile(file: File) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new UploadImageError(
      "Format gambar tidak didukung. Gunakan PNG, JPEG, WEBP, atau GIF.",
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadImageError("Ukuran gambar maksimal 5MB.");
  }
}

/**
 * Upload satu file gambar ke bucket Supabase Storage `materi-images`
 * (bucket public) dan mengembalikan public URL-nya.
 *
 * Melempar `UploadImageError` jika validasi gagal atau upload gagal.
 */
export async function uploadMateriImage(file: File): Promise<string> {
  validateImageFile(file);

  const fileName = generateUniqueFileName(file.name);
  // dikelompokkan per hari supaya folder tidak terlalu penuh, opsional
  const path = `${new Date().toISOString().slice(0, 10)}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new UploadImageError(
      `Gagal mengunggah gambar: ${uploadError.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new UploadImageError("Gagal mendapatkan URL publik gambar.");
  }

  return data.publicUrl;
}