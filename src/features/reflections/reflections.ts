import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

export interface Reflection {
  id: number;
  student_id: number;
  meeting_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReflectionWithStudent extends Reflection {
  student_name: string;
}

function currentStudentId(): number | null {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return null;
  const id = Number(user.id);
  return Number.isFinite(id) ? id : null;
}

/** Ambil semua refleksi milik siswa yang sedang login, keyed by meeting_id. */
export async function fetchMyReflections(): Promise<Record<number, Reflection>> {
  const studentId = currentStudentId();
  if (studentId === null) return {};

  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("student_id", studentId);

  if (error || !data) return {};

  const map: Record<number, Reflection> = {};
  for (const row of data as Reflection[]) map[row.meeting_id] = row;
  return map;
}

/** Simpan/update refleksi siswa untuk satu pertemuan. */
export async function saveMyReflection(meetingId: number, content: string): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengirim refleksi.");
  }

  await supabase.from("reflections").upsert(
    {
      student_id: studentId,
      meeting_id: meetingId,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,meeting_id" }
  );
}

/** Hapus refleksi siswa untuk satu pertemuan (supaya bisa nulis ulang dari kosong). */
export async function deleteMyReflection(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa menghapus refleksi.");
  }

  await supabase
    .from("reflections")
    .delete()
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId);
}

/** Guru: ambil semua refleksi siswa, terbaru dulu, lengkap dengan nama siswa. */
export async function fetchAllReflectionsForTeacher(): Promise<ReflectionWithStudent[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*, students(full_name)")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    id: row.id,
    student_id: row.student_id,
    meeting_id: row.meeting_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    student_name: row.students?.full_name ?? "Siswa",
  }));
}