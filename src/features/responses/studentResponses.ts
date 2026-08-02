import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

export interface StudentResponse {
  id: number;
  meeting_id: number;
  student_id: number;
  group_id: number | null;
  response: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResponseWithRelations extends StudentResponse {
  student_name: string;
  group_name: string | null;
  meeting_title: string;
}

interface ResponseJoinRow extends StudentResponse {
  students: { id: number; full_name: string } | null;
  groups: { id: number; group_name: string } | null;
  meetings: { id: number; title: string } | null;
}

function currentStudentId(): number | null {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return null;
  const id = Number(user.id);
  return Number.isFinite(id) ? id : null;
}

/** Ambil id kelompok siswa yang sedang login (atau null kalau belum masuk kelompok). */
export async function fetchMyGroupId(): Promise<number | null> {
  const studentId = currentStudentId();
  if (studentId === null) return null;

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("student_id", studentId)
    .limit(1);

  if (error || !data) return null;
  return data[0]?.group_id ?? null;
}

/** Ambil semua tanggapan milik siswa yang sedang login, keyed by meeting_id. */
export async function fetchMyResponses(): Promise<Record<number, StudentResponse>> {
  const studentId = currentStudentId();
  if (studentId === null) return {};

  const { data, error } = await supabase
    .from("student_responses")
    .select("*")
    .eq("student_id", studentId);

  if (error || !data) return {};

  const map: Record<number, StudentResponse> = {};
  for (const row of data as StudentResponse[]) map[row.meeting_id] = row;
  return map;
}

/** Simpan/update tanggapan siswa untuk satu pertemuan. */
export async function saveMyResponse(
  meetingId: number,
  groupId: number | null,
  response: string,
): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengirim tanggapan.");
  }

  const { error } = await supabase.from("student_responses").upsert(
    {
      student_id: studentId,
      meeting_id: meetingId,
      group_id: groupId,
      response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,meeting_id" },
  );

  if (error) throw error;
}

/** Hapus tanggapan siswa untuk satu pertemuan (supaya bisa nulis ulang dari kosong). */
export async function deleteMyResponse(meetingId: number): Promise<void> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa menghapus tanggapan.");
  }

  const { error } = await supabase
    .from("student_responses")
    .delete()
    .eq("student_id", studentId)
    .eq("meeting_id", meetingId);

  if (error) throw error;
}

/** Guru: ambil semua tanggapan siswa, lengkap dengan nama siswa, kelompok, dan pertemuan. */
export async function fetchAllResponsesForTeacher(): Promise<StudentResponseWithRelations[]> {
  const { data, error } = await supabase
    .from("student_responses")
    .select(
      `
      *,
      students!student_id ( id, full_name ),
      groups!group_id ( id, group_name ),
      meetings!meeting_id ( id, title )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return (data as ResponseJoinRow[]).map((row) => ({
    id: row.id,
    meeting_id: row.meeting_id,
    student_id: row.student_id,
    group_id: row.group_id,
    response: row.response,
    created_at: row.created_at,
    updated_at: row.updated_at,
    student_name: row.students?.full_name ?? "Siswa",
    group_name: row.groups?.group_name ?? null,
    meeting_title: row.meetings?.title ?? `Pertemuan ${row.meeting_id}`,
  }));
}
