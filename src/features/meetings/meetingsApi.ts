import { supabase } from "@/lib/supabase";
import { removeGroupProductFile } from "@/lib/upload-group-product";

export type MeetingStatus = "draft" | "published";

export interface MeetingSummary {
  id: number;
  title: string;
  subtitle: string;
  order: number;
  status: MeetingStatus;
  presentationLocked: boolean;
}

/**
 * Daftar pertemuan sekarang dinamis dari tabel `meetings` di Supabase —
 * dulunya array statis di data.ts (guru tidak bisa tambah/hapus pertemuan
 * sama sekali). Field per-tahap CIRC (isi materi tiap tahap) tetap di
 * tabel `materi_konten`, tidak berubah.
 */
export async function fetchMeetings(): Promise<MeetingSummary[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("id, title, subtitle, meeting_order, status, presentation_locked")
    .order("meeting_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    order: row.meeting_order,
    status: (row.status ?? "draft") as MeetingStatus,
    presentationLocked: row.presentation_locked ?? false,
  }));
}

export async function fetchMeetingById(id: number): Promise<MeetingSummary | null> {
  const { data, error } = await supabase
    .from("meetings")
    .select("id, title, subtitle, meeting_order, status, presentation_locked")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle ?? "",
    order: data.meeting_order,
    status: (data.status ?? "draft") as MeetingStatus,
    presentationLocked: data.presentation_locked ?? false,
  };
}

/** Guru: kunci/buka sesi presentasi untuk satu pertemuan. Saat dikunci,
 * pertanyaan & apresiasi siswa untuk pertemuan itu menjadi read-only. */
export async function updateMeetingPresentationLock(id: number, locked: boolean): Promise<void> {
  const { error } = await supabase
    .from("meetings")
    .update({ presentation_locked: locked, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

/** Tambah pertemuan baru. Selalu dibuat sebagai draft & ditaruh di urutan paling akhir. */
export async function createMeeting(title: string, subtitle: string): Promise<MeetingSummary | null> {
  const existing = await fetchMeetings();
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((m) => m.order)) + 1 : 1;

  const { data, error } = await supabase
    .from("meetings")
    .insert({ title, subtitle, meeting_order: nextOrder, status: "draft" })
    .select("id, title, subtitle, meeting_order, status, presentation_locked")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle ?? "",
    order: data.meeting_order,
    status: (data.status ?? "draft") as MeetingStatus,
    presentationLocked: data.presentation_locked ?? false,
  };
}

export async function updateMeetingStatus(id: number, status: MeetingStatus): Promise<void> {
  await supabase
    .from("meetings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
}

/**
 * Hapus pertemuan beserta semua data terkait di tabel lain (isi materi,
 * progres siswa, refleksi). Tidak pakai FK cascade di database, jadi
 * urutan hapusnya manual di sini.
 */
export async function deleteMeeting(id: number): Promise<void> {
  // Produk kelompok punya file di Storage -- hapus filenya dulu sebelum
  // baris DB-nya lenyap, supaya tidak ada file yatim tertinggal di bucket
  // `presentasi-produk`.
  const { data: products } = await supabase
    .from("group_products")
    .select("storage_path")
    .eq("meeting_id", id);

  await Promise.all((products ?? []).map((p) => removeGroupProductFile(p.storage_path)));

  await Promise.all([
    supabase.from("materi_konten").delete().eq("meeting_id", id),
    supabase.from("meeting_progress").delete().eq("meeting_id", id),
    supabase.from("reflections").delete().eq("meeting_id", id),
    supabase.from("student_responses").delete().eq("meeting_id", id),
    supabase.from("group_products").delete().eq("meeting_id", id),
    supabase.from("presentation_questions").delete().eq("meeting_id", id),
    supabase.from("presentation_appreciations").delete().eq("meeting_id", id),
  ]);
  await supabase.from("meetings").delete().eq("id", id);

  // Rapikan meeting_order sisanya jadi 1..N lagi (biar tidak ada
  // "Pertemuan 1, 2, 4, 5" pas pertemuan 3 dihapus).
  const remaining = await fetchMeetings();
  await Promise.all(
    remaining.map((m, idx) =>
      m.order !== idx + 1
        ? supabase.from("meetings").update({ meeting_order: idx + 1 }).eq("id", m.id)
        : Promise.resolve()
    )
  );
}