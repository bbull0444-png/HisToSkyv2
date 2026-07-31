import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";
import { MEETINGS } from "./data";
import type { MeetingProgressStatus } from "./types";

/**
 * Progress belajar siswa per pertemuan — disimpan di tabel Supabase
 * `meeting_progress` (bukan localStorage lagi), supaya:
 * - Tersimpan lintas device (siswa bisa lanjut belajar dari HP atau laptop).
 * - Bisa dipantau guru dari sisi guru (rekap-nilai, laporan, dst).
 *
 * CATATAN: siswa saat ini login tanpa sesi Supabase Auth sungguhan (lihat
 * AuthContext.tsx), jadi permintaan ke tabel ini berjalan sebagai role
 * "anon". RLS mengizinkan anon baca/tulis baris manapun di tabel ini —
 * keterbatasan bawaan selama siswa belum migrasi ke Supabase Auth asli.
 */

export type MeetingRowStatus = "in-progress" | "completed";

export type ProgressMap = Record<number, MeetingRowStatus>;

function currentStudentId(): number | null {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return null;
  const id = Number(user.id);
  return Number.isFinite(id) ? id : null;
}

/** Ambil semua baris progres siswa yang sedang login, sekali fetch. */
export async function fetchProgressMap(): Promise<ProgressMap> {
  const studentId = currentStudentId();
  if (studentId === null) return {};

  const { data, error } = await supabase
    .from("meeting_progress")
    .select("meeting_id, status")
    .eq("student_id", studentId);

  if (error || !data) return {};

  const map: ProgressMap = {};
  for (const row of data) {
    map[row.meeting_id as number] = row.status as MeetingRowStatus;
  }
  return map;
}

/**
 * Pertemuan 1 selalu terbuka. Pertemuan N terbuka hanya jika
 * pertemuan N-1 berstatus "completed" di `progressMap`.
 */
export function isMeetingUnlockedIn(progressMap: ProgressMap, meetingId: number): boolean {
  if (meetingId <= 1) return true;
  return progressMap[meetingId - 1] === "completed";
}

export function getMeetingProgressStatusIn(
  progressMap: ProgressMap,
  meetingId: number
): MeetingProgressStatus {
  if (!isMeetingUnlockedIn(progressMap, meetingId)) return "locked";
  const status = progressMap[meetingId];
  if (status === "completed") return "completed";
  if (status === "in-progress") return "in-progress";
  return "not-started";
}

/**
 * Tandai pertemuan sudah dibuka siswa (dipanggil sekali saat halaman
 * detail pertemuan mount). Tidak menimpa status "completed" yang sudah
 * ada — pakai INSERT ... ON CONFLICT DO NOTHING.
 */
export async function markMeetingOpened(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) return;

  await supabase.from("meeting_progress").upsert(
    {
      student_id: studentId,
      meeting_id: meetingId,
      status: "in-progress",
    },
    { onConflict: "student_id,meeting_id", ignoreDuplicates: true }
  );
}

/**
 * Tandai pertemuan selesai (tombol "Tandai Selesai" di tahap terakhir).
 * Otomatis membuka pertemuan berikutnya karena unlock logic membaca
 * status "completed" ini.
 */
export async function markMeetingCompleted(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) return;

  await supabase.from("meeting_progress").upsert(
    {
      student_id: studentId,
      meeting_id: meetingId,
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,meeting_id" }
  );
}

export function getOverallProgressIn(progressMap: ProgressMap): { completed: number; total: number } {
  const total = MEETINGS.length;
  const completed = Object.values(progressMap).filter((s) => s === "completed").length;
  return { completed, total };
}