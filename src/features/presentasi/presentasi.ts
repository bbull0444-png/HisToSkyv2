import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";
import {
  uploadGroupProductFile,
  removeGroupProductFile,
  type GroupProductFileType,
} from "@/lib/upload-group-product";

function currentStudentId(): number | null {
  const user = getStoredUser();

  console.log("===== STORED USER =====");
  console.log(user);

  if (!user || user.role !== "siswa") return null;

  const id = Number(user.id);

  console.log("===== STUDENT ID =====");
  console.log(id);

  return Number.isFinite(id) ? id : null;
}

function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

// ---------------------------------------------------------------------------
// Produk Kelompok
// ---------------------------------------------------------------------------

export interface GroupProduct {
  id: number;
  meeting_id: number;
  group_id: number;
  uploaded_by_student_id: number | null;
  file_url: string;
  storage_path: string;
  file_name: string;
  file_type: GroupProductFileType;
  file_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface GroupProductWithGroup extends GroupProduct {
  group_name: string;
}

/**
 * Konteks kelompok siswa yang sedang login: id kelompok & apakah dia ketuanya.
 *
 * SENGAJA dua query terpisah (bukan satu query dengan embed `groups(...)`
 * di-filter `student_id`) -- ini pola yang sama dengan `fetchMyGroupId`
 * (studentResponses.ts) dan `MyGroupCard.determineGroup` (satu-satunya pola
 * yang terbukti berhasil di app ini untuk relasi group_members -> groups
 * dari sisi siswa). Query gabungan (embed + filter student_id dalam satu
 * panggilan) pernah dipakai di sini dan menyebabkan fungsi ini selalu
 * mengembalikan null walau siswa sudah tergabung di kelompok.
 */
export async function fetchMyGroupContext(): Promise<{ groupId: number; isLeader: boolean } | null> {
  const studentId = currentStudentId();
  if (studentId === null) return null;

  const { data: allMembersUnfiltered } = await supabase
    .from("group_members")
    .select("*");

  console.log("===== GROUP_MEMBERS TANPA FILTER (role anon) =====");
  console.log(allMembersUnfiltered);

  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("student_id", studentId)
    .limit(1);

console.log("===== MEMBERSHIP =====");
console.log(membership);

console.log("===== MEMBERSHIP ERROR =====");
console.log(membershipError);

  if (membershipError) {
    console.error("fetchMyGroupContext: gagal membaca group_members:", membershipError);
    return null;
  }

  const groupId = membership?.[0]?.group_id;
  if (!groupId) return null;

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("leader_student_id")
    .eq("id", groupId)
    .maybeSingle();

  console.log("fetchMyGroupContext error:", groupError);
  console.log("fetchMyGroupContext data:", group);

  if (groupError) {
    console.error("fetchMyGroupContext: gagal membaca groups:", groupError);
    return null;
  }

  return {
    groupId,
    isLeader: group?.leader_student_id === studentId,
  };
}

/** Guru: hapus produk kelompok (file di Storage dihapus dulu, baru baris DB -- pola sama dengan `deleteMeeting`). */
export async function deleteGroupProduct(product: Pick<GroupProduct, "id" | "storage_path">): Promise<void> {
  await removeGroupProductFile(product.storage_path);
  const { error } = await supabase.from("group_products").delete().eq("id", product.id);
  if (error) throw error;
}

/** Semua produk kelompok untuk satu pertemuan, lengkap nama kelompok. Terlihat oleh seluruh siswa. */
export async function fetchGroupProducts(meetingId: number): Promise<GroupProductWithGroup[]> {
  const { data, error } = await supabase
    .from("group_products")
    .select(`*, groups!group_id ( group_name )`)
    .eq("meeting_id", meetingId)
    .order("group_id", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    ...row,
    group_name: asSingle(row.groups)?.group_name ?? "Kelompok",
  }));
}

/**
 * Upload atau ganti produk aktif kelompok. Hanya ketua kelompok yang boleh
 * memanggil ini (dicek di sini, client-side -- konsisten dengan pola
 * otorisasi tabel lain di app, RLS tetap permisif).
 *
 * Urutan operasi SENGAJA: upload file baru -> update/insert baris DB ->
 * baru hapus file lama. Ini memastikan tidak pernah ada window di mana
 * baris DB menunjuk ke file yang sudah terhapus (broken reference) jika
 * ada kegagalan di tengah proses.
 */
export async function uploadOrReplaceGroupProduct(
  meetingId: number,
  groupId: number,
  file: File,
): Promise<GroupProduct> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengunggah produk kelompok.");
  }

  const context = await fetchMyGroupContext();
  if (!context || context.groupId !== groupId || !context.isLeader) {
    throw new Error("Hanya ketua kelompok yang bisa mengunggah produk.");
  }

  const { data: existing } = await supabase
    .from("group_products")
    .select("id, storage_path")
    .eq("meeting_id", meetingId)
    .eq("group_id", groupId)
    .maybeSingle();

  // 1. Upload file baru dulu.
  const uploaded = await uploadGroupProductFile(meetingId, groupId, file);

  // 2. Update/insert baris DB.
  const payload = {
    meeting_id: meetingId,
    group_id: groupId,
    uploaded_by_student_id: studentId,
    file_url: uploaded.fileUrl,
    storage_path: uploaded.storagePath,
    file_name: uploaded.fileName,
    file_type: uploaded.fileType,
    file_size_bytes: uploaded.fileSizeBytes,
    updated_at: new Date().toISOString(),
  };

  let saved: GroupProduct;
  if (existing) {
    const { data, error } = await supabase
      .from("group_products")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    saved = data as GroupProduct;
  } else {
    const { data, error } = await supabase
      .from("group_products")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    saved = data as GroupProduct;
  }

  // 3. Baru hapus file lama, setelah baris DB pasti sudah menunjuk ke file baru.
  if (existing?.storage_path) {
    await removeGroupProductFile(existing.storage_path);
  }

  return saved;
}

// ---------------------------------------------------------------------------
// Pertanyaan
// ---------------------------------------------------------------------------

export interface PresentationQuestion {
  id: number;
  meeting_id: number;
  student_id: number;
  target_group_id: number;
  question: string;
  is_selected: boolean;
  selected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresentationQuestionWithRelations extends PresentationQuestion {
  student_name: string;
  target_group_name: string;
}

/** Pertanyaan milik siswa yang sedang login untuk satu pertemuan (maksimal satu baris, lihat catatan di presentasi_kelompok.sql). */
export async function fetchMyQuestion(meetingId: number): Promise<PresentationQuestion | null> {
  const studentId = currentStudentId();
  if (studentId === null) return null;

  const { data, error } = await supabase
    .from("presentation_questions")
    .select("*")
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as PresentationQuestion;
}

/**
 * Simpan pertanyaan siswa (insert pertama kali, update kalau sudah ada
 * termasuk ganti kelompok tujuan). Dipanggil hanya saat sesi presentasi
 * BELUM dikunci guru -- pengecekan lock dilakukan di UI pemanggil, bukan
 * di sini (sama seperti pola otorisasi lain di app).
 */
export async function saveMyQuestion(
  meetingId: number,
  targetGroupId: number,
  question: string,
): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengirim pertanyaan.");
  }

  const existing = await fetchMyQuestion(meetingId);

  if (existing) {
    const { error } = await supabase
      .from("presentation_questions")
      .update({
        target_group_id: targetGroupId,
        question,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("presentation_questions").insert({
    student_id: studentId,
    meeting_id: meetingId,
    target_group_id: targetGroupId,
    question,
  });
  if (error) throw error;
}

export async function deleteMyQuestion(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa menghapus pertanyaan.");
  }

  const { error } = await supabase
    .from("presentation_questions")
    .delete()
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId);
  if (error) throw error;
}

/** Guru: semua pertanyaan untuk satu pertemuan, lengkap nama siswa & kelompok tujuan. */
export async function fetchQuestionsForMeeting(
  meetingId: number,
): Promise<PresentationQuestionWithRelations[]> {
  const { data, error } = await supabase
    .from("presentation_questions")
    .select(
      `
      *,
      students!student_id ( full_name ),
      groups!target_group_id ( group_name )
    `,
    )
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    ...row,
    student_name: asSingle(row.students)?.full_name ?? "Siswa",
    target_group_name: asSingle(row.groups)?.group_name ?? "-",
  }));
}

/**
 * Guru: tandai pertanyaan untuk ditampilkan (atau batal ditampilkan) saat
 * presentasi. Hanya satu pertanyaan aktif per pertemuan -- saat satu
 * pertanyaan dipilih, pertanyaan lain di pertemuan yang sama otomatis
 * dilepas, supaya "Pertanyaan Terpilih Guru" di halaman siswa selalu
 * merujuk ke satu pertanyaan yang sama dengan yang guru maksud.
 */
export async function setQuestionSelected(
  meetingId: number,
  id: number,
  selected: boolean,
): Promise<void> {
  if (selected) {
    const { error: deselectError } = await supabase
      .from("presentation_questions")
      .update({ is_selected: false, selected_at: null })
      .eq("meeting_id", meetingId)
      .neq("id", id);
    if (deselectError) throw deselectError;
  }

  const { error } = await supabase
    .from("presentation_questions")
    .update({
      is_selected: selected,
      selected_at: selected ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Guru: hapus satu pertanyaan siswa (bukan milik sendiri, beda dari `deleteMyQuestion`). */
export async function deleteQuestionById(id: number): Promise<void> {
  const { error } = await supabase.from("presentation_questions").delete().eq("id", id);
  if (error) throw error;
}

/** Pertanyaan yang sedang ditandai guru untuk ditampilkan pada halaman Materi siswa. */
export async function fetchSelectedQuestion(
  meetingId: number,
): Promise<PresentationQuestionWithRelations | null> {
  const { data, error } = await supabase
    .from("presentation_questions")
    .select(
      `
      *,
      students!student_id ( full_name ),
      groups!target_group_id ( group_name )
    `,
    )
    .eq("meeting_id", meetingId)
    .eq("is_selected", true)
    .order("selected_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as any;
  return {
    ...row,
    student_name: asSingle(row.students)?.full_name ?? "Siswa",
    target_group_name: asSingle(row.groups)?.group_name ?? "-",
  };
}

// ---------------------------------------------------------------------------
// Apresiasi
// ---------------------------------------------------------------------------

export interface PresentationAppreciation {
  id: number;
  meeting_id: number;
  student_id: number;
  target_group_id: number;
  message: string;
  is_selected: boolean;
  selected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresentationAppreciationWithRelations extends PresentationAppreciation {
  student_name: string;
  target_group_name: string;
}

export async function fetchMyAppreciation(meetingId: number): Promise<PresentationAppreciation | null> {
  const studentId = currentStudentId();
  if (studentId === null) return null;

  const { data, error } = await supabase
    .from("presentation_appreciations")
    .select("*")
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as PresentationAppreciation;
}

export async function saveMyAppreciation(
  meetingId: number,
  targetGroupId: number,
  message: string,
): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengirim apresiasi.");
  }

  const existing = await fetchMyAppreciation(meetingId);

  if (existing) {
    const { error } = await supabase
      .from("presentation_appreciations")
      .update({
        target_group_id: targetGroupId,
        message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("presentation_appreciations").insert({
    student_id: studentId,
    meeting_id: meetingId,
    target_group_id: targetGroupId,
    message,
  });
  if (error) throw error;
}

export async function deleteMyAppreciation(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa menghapus apresiasi.");
  }

  const { error } = await supabase
    .from("presentation_appreciations")
    .delete()
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId);
  if (error) throw error;
}

/** Guru: semua apresiasi untuk satu pertemuan, lengkap nama siswa & kelompok tujuan. */
export async function fetchAppreciationsForMeeting(
  meetingId: number,
): Promise<PresentationAppreciationWithRelations[]> {
  const { data, error } = await supabase
    .from("presentation_appreciations")
    .select(
      `
      *,
      students!student_id ( full_name ),
      groups!target_group_id ( group_name )
    `,
    )
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    ...row,
    student_name: asSingle(row.students)?.full_name ?? "Siswa",
    target_group_name: asSingle(row.groups)?.group_name ?? "-",
  }));
}

/** Guru: hapus satu apresiasi siswa (bukan milik sendiri, beda dari `deleteMyAppreciation`). */
export async function deleteAppreciationById(id: number): Promise<void> {
  const { error } = await supabase.from("presentation_appreciations").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Guru: tandai apresiasi untuk ditampilkan (atau batal ditampilkan) saat
 * presentasi. Hanya satu apresiasi aktif per pertemuan -- saat satu
 * apresiasi dipilih, apresiasi lain di pertemuan yang sama otomatis
 * dilepas, sama seperti `setQuestionSelected`.
 */
export async function setAppreciationSelected(
  meetingId: number,
  id: number,
  selected: boolean,
): Promise<void> {
  if (selected) {
    const { error: deselectError } = await supabase
      .from("presentation_appreciations")
      .update({ is_selected: false, selected_at: null })
      .eq("meeting_id", meetingId)
      .neq("id", id);
    if (deselectError) throw deselectError;
  }

  const { error } = await supabase
    .from("presentation_appreciations")
    .update({
      is_selected: selected,
      selected_at: selected ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Apresiasi yang sedang ditandai guru untuk ditampilkan pada halaman Materi siswa. */
export async function fetchSelectedAppreciation(
  meetingId: number,
): Promise<PresentationAppreciationWithRelations | null> {
  const { data, error } = await supabase
    .from("presentation_appreciations")
    .select(
      `
      *,
      students!student_id ( full_name ),
      groups!target_group_id ( group_name )
    `,
    )
    .eq("meeting_id", meetingId)
    .eq("is_selected", true)
    .order("selected_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as any;
  return {
    ...row,
    student_name: asSingle(row.students)?.full_name ?? "Siswa",
    target_group_name: asSingle(row.groups)?.group_name ?? "-",
  };
}

// ---------------------------------------------------------------------------
// Reset (administrasi guru)
// ---------------------------------------------------------------------------

/**
 * Guru: hapus SELURUH data presentasi (produk kelompok + file Storage-nya,
 * seluruh pertanyaan, seluruh apresiasi) untuk satu pertemuan. Pertemuan
 * itu sendiri tidak dihapus -- hanya data tahap Presentasi-nya saja.
 * Urutan sama seperti pembersihan di `deleteMeeting` (meetingsApi.ts):
 * hapus file Storage dulu, baru baris DB.
 */
export async function resetPresentationForMeeting(meetingId: number): Promise<void> {
  const { data: products } = await supabase
    .from("group_products")
    .select("storage_path")
    .eq("meeting_id", meetingId);

  await Promise.all((products ?? []).map((p) => removeGroupProductFile(p.storage_path)));

  await Promise.all([
    supabase.from("group_products").delete().eq("meeting_id", meetingId),
    supabase.from("presentation_questions").delete().eq("meeting_id", meetingId),
    supabase.from("presentation_appreciations").delete().eq("meeting_id", meetingId),
  ]);
}
