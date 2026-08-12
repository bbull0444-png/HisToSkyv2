import { supabase } from "@/lib/supabase";
import { fetchMyGroupContext } from "@/features/presentasi/presentasi";

function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export interface GroupAward {
  id: number;
  meeting_id: number;
  group_id: number;
  /** Apresiasi guru untuk kelompok ini -- hanya dibaca anggota kelompok itu. */
  message: string;
  /** Pin "kelompok terbaik" -- dibaca SELURUH siswa, bukan cuma kelompoknya. */
  is_best: boolean;
  best_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupAwardWithGroup extends GroupAward {
  group_name: string;
}

/** Satu baris kelola per kelompok: kelompok yang belum diberi apresiasi tetap muncul (award null). */
export interface GroupAwardRow {
  group_id: number;
  group_name: string;
  award: GroupAward | null;
}

// ---------------------------------------------------------------------------
// Guru
// ---------------------------------------------------------------------------

/**
 * Semua kelompok + apresiasinya untuk satu pertemuan. Sengaja berangkat dari
 * tabel `groups` (bukan dari `group_awards`) supaya kelompok yang belum diberi
 * apresiasi tetap tampil di halaman moderasi -- kalau tidak, guru tidak punya
 * tempat untuk mulai menulis.
 */
export async function fetchAwardRowsForMeeting(meetingId: number): Promise<GroupAwardRow[]> {
  const [groupsRes, awardsRes] = await Promise.all([
    supabase.from("groups").select("id, group_name").order("group_name", { ascending: true }),
    supabase.from("group_awards").select("*").eq("meeting_id", meetingId),
  ]);

  const groups = groupsRes.data ?? [];
  const awardByGroup = new Map<number, GroupAward>(
    (awardsRes.data ?? []).map((a) => [a.group_id as number, a as GroupAward]),
  );

  return groups.map((g) => ({
    group_id: g.id,
    group_name: g.group_name,
    award: awardByGroup.get(g.id) ?? null,
  }));
}

/**
 * Simpan/ubah apresiasi guru untuk satu kelompok. Insert kalau kelompok itu
 * belum punya baris pada pertemuan ini, update kalau sudah -- `is_best` tidak
 * pernah disentuh di sini supaya menulis ulang apresiasi tidak diam-diam
 * melepas pin kelompok terbaik.
 */
export async function saveGroupAward(
  meetingId: number,
  groupId: number,
  message: string,
): Promise<void> {
  const { data: existing } = await supabase
    .from("group_awards")
    .select("id")
    .eq("meeting_id", meetingId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("group_awards")
      .update({ message, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("group_awards")
    .insert({ meeting_id: meetingId, group_id: groupId, message });
  if (error) throw error;
}

/**
 * Tandai (atau lepas) satu kelompok sebagai kelompok terbaik pertemuan ini.
 *
 * Urutan SENGAJA "lepas semua dulu, baru pasang" -- indeks unik parsial
 * `group_awards_one_best_per_meeting` hanya mengizinkan satu baris is_best per
 * pertemuan, jadi urutan terbalik akan ditolak database. Pola ini sama dengan
 * `setQuestionSelected`/`setAppreciationSelected` di presentasi.ts.
 */
export async function setBestGroup(
  meetingId: number,
  groupId: number,
  isBest: boolean,
  bestNote?: string,
): Promise<void> {
  const { error: clearError } = await supabase
    .from("group_awards")
    .update({ is_best: false, best_note: null, updated_at: new Date().toISOString() })
    .eq("meeting_id", meetingId)
    .eq("is_best", true);
  if (clearError) throw clearError;

  if (!isBest) return;

  // Kelompok bisa saja dipin tanpa pernah diberi apresiasi tertulis, jadi
  // barisnya dibuat di sini kalau memang belum ada.
  const { data: existing } = await supabase
    .from("group_awards")
    .select("id")
    .eq("meeting_id", meetingId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("group_awards")
      .update({
        is_best: true,
        best_note: bestNote?.trim() ? bestNote.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("group_awards").insert({
    meeting_id: meetingId,
    group_id: groupId,
    is_best: true,
    best_note: bestNote?.trim() ? bestNote.trim() : null,
  });
  if (error) throw error;
}

/** Hapus apresiasi satu kelompok (termasuk pin-nya, karena barisnya ikut hilang). */
export async function deleteGroupAward(meetingId: number, groupId: number): Promise<void> {
  const { error } = await supabase
    .from("group_awards")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("group_id", groupId);
  if (error) throw error;
}

/** Hapus seluruh penghargaan pertemuan ini (sejajar dengan `resetPresentationForMeeting`). */
export async function resetAwardsForMeeting(meetingId: number): Promise<void> {
  const { error } = await supabase.from("group_awards").delete().eq("meeting_id", meetingId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Siswa
// ---------------------------------------------------------------------------

/**
 * Apresiasi guru untuk kelompok siswa yang sedang login. Null kalau siswa
 * belum masuk kelompok mana pun, atau kelompoknya belum diberi apresiasi.
 */
export async function fetchMyGroupAward(meetingId: number): Promise<GroupAwardWithGroup | null> {
  const context = await fetchMyGroupContext();
  if (!context) return null;

  const { data, error } = await supabase
    .from("group_awards")
    .select(`*, groups!group_id ( group_name )`)
    .eq("meeting_id", meetingId)
    .eq("group_id", context.groupId)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as any;
  return { ...row, group_name: asSingle(row.groups)?.group_name ?? "Kelompok" };
}

/** Kelompok terbaik yang dipin guru -- sengaja tanpa filter kelompok, semua siswa melihatnya. */
export async function fetchBestGroup(meetingId: number): Promise<GroupAwardWithGroup | null> {
  const { data, error } = await supabase
    .from("group_awards")
    .select(`*, groups!group_id ( group_name )`)
    .eq("meeting_id", meetingId)
    .eq("is_best", true)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0] as any;
  return { ...row, group_name: asSingle(row.groups)?.group_name ?? "Kelompok" };
}
