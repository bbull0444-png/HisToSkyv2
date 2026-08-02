import { supabase } from "@/lib/supabase";

const BUCKET = "presentasi-produk";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export type GroupProductFileType = "pdf" | "png" | "jpg" | "ppt";

const MIME_TO_TYPE: Record<string, GroupProductFileType> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "ppt",
};

export class UploadGroupProductError extends Error {}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "bin";
}

function generateUniqueFileName(originalName: string): string {
  const ext = getFileExtension(originalName);
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${uniqueId}.${ext}`;
}

function validateProductFile(file: File): GroupProductFileType {
  const type = MIME_TO_TYPE[file.type];
  if (!type) {
    throw new UploadGroupProductError(
      "Format file tidak didukung. Gunakan PDF, PPT/PPTX, PNG, atau JPG.",
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadGroupProductError("Ukuran file maksimal 20MB.");
  }

  return type;
}

export interface UploadedGroupProduct {
  fileUrl: string;
  storagePath: string;
  fileName: string;
  fileType: GroupProductFileType;
  fileSizeBytes: number;
}

/**
 * Upload file produk kelompok ke bucket `presentasi-produk`.
 * Hanya mengunggah -- TIDAK menghapus file lama (lihat
 * `uploadOrReplaceGroupProduct` di features/presentasi/presentasi.ts untuk
 * urutan replace yang aman: upload baru -> update DB -> baru hapus lama).
 */
export async function uploadGroupProductFile(
  meetingId: number,
  groupId: number,
  file: File,
): Promise<UploadedGroupProduct> {
  const fileType = validateProductFile(file);
  const fileName = generateUniqueFileName(file.name);
  const path = `${meetingId}/${groupId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new UploadGroupProductError(
      `Gagal mengunggah file: ${uploadError.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new UploadGroupProductError("Gagal mendapatkan URL publik file.");
  }

  return {
    fileUrl: data.publicUrl,
    storagePath: path,
    fileName: file.name,
    fileType,
    fileSizeBytes: file.size,
  };
}

/** Hapus satu file produk dari storage berdasarkan path-nya. */
export async function removeGroupProductFile(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) {
    // File lama gagal dihapus bukan alasan untuk membatalkan operasi yang
    // sudah berhasil (upload baru + update DB) -- cukup dicatat di console,
    // sisa file yatim bisa dibersihkan manual dari dashboard bila perlu.
    console.error("Gagal menghapus file lama produk kelompok:", error);
  }
}
