import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

export type TestType = "pretest" | "posttest_siklus_1" | "posttest_siklus_2" | "posttest_siklus_3";

export const TEST_TYPES: { type: TestType; label: string }[] = [
  { type: "pretest", label: "Pretest" },
  { type: "posttest_siklus_1", label: "Posttest Siklus 1" },
  { type: "posttest_siklus_2", label: "Posttest Siklus 2" },
  { type: "posttest_siklus_3", label: "Posttest Siklus 3" },
];

export interface TestQuestion {
  id: number;
  test_type: TestType;
  order: number;
  question_text: string;
  options: string[];
  correct_index: number;
}

export interface TestAttempt {
  id: number;
  student_id: number;
  test_type: TestType;
  score: number;
  total_questions: number;
  correct_count: number;
  submitted_at: string;
}

export interface TestAttemptWithStudent extends TestAttempt {
  student_name: string;
}

function currentStudentId(): number | null {
  const user = getStoredUser();
  if (!user || user.role !== "siswa") return null;
  const id = Number(user.id);
  return Number.isFinite(id) ? id : null;
}

// ---------- Soal (guru) ----------

export async function fetchQuestions(testType: TestType): Promise<TestQuestion[]> {
  const { data, error } = await supabase
    .from("test_questions")
    .select("id, test_type, question_order, question_text, options, correct_index")
    .eq("test_type", testType)
    .order("question_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    test_type: row.test_type,
    order: row.question_order,
    question_text: row.question_text,
    options: row.options as string[],
    correct_index: row.correct_index,
  }));
}

export async function createQuestion(
  testType: TestType,
  questionText: string,
  options: string[],
  correctIndex: number
): Promise<TestQuestion | null> {
  const existing = await fetchQuestions(testType);
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((q) => q.order)) + 1 : 1;

  const { data, error } = await supabase
    .from("test_questions")
    .insert({
      test_type: testType,
      question_order: nextOrder,
      question_text: questionText,
      options,
      correct_index: correctIndex,
    })
    .select("id, test_type, question_order, question_text, options, correct_index")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    test_type: data.test_type,
    order: data.question_order,
    question_text: data.question_text,
    options: data.options as string[],
    correct_index: data.correct_index,
  };
}

export async function updateQuestion(
  id: number,
  questionText: string,
  options: string[],
  correctIndex: number
): Promise<void> {
  await supabase
    .from("test_questions")
    .update({
      question_text: questionText,
      options,
      correct_index: correctIndex,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function deleteQuestion(id: number): Promise<void> {
  await supabase.from("test_questions").delete().eq("id", id);
}

// ---------- Pengerjaan (siswa) ----------

export async function fetchMyAttempt(testType: TestType): Promise<TestAttempt | null> {
  const studentId = currentStudentId();
  if (studentId === null) return null;

  const { data, error } = await supabase
    .from("test_attempts")
    .select("id, student_id, test_type, score, total_questions, correct_count, submitted_at")
    .eq("student_id", studentId)
    .eq("test_type", testType)
    .maybeSingle();

  if (error || !data) return null;
  return data as TestAttempt;
}

/** Submit jawaban, auto-nilai di client lalu simpan hasilnya. */
export async function submitAttempt(
  testType: TestType,
  answers: Record<number, number>
): Promise<TestAttempt | null> {
  const studentId = currentStudentId();
  if (studentId === null) {
    throw new Error("Hanya akun siswa yang bisa mengerjakan test.");
  }

  const questions = await fetchQuestions(testType);
  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_index) correctCount += 1;
  }
  const total = questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const { data, error } = await supabase
    .from("test_attempts")
    .insert({
      student_id: studentId,
      test_type: testType,
      score,
      total_questions: total,
      correct_count: correctCount,
      answers,
    })
    .select("id, student_id, test_type, score, total_questions, correct_count, submitted_at")
    .single();

  if (error || !data) return null;
  return data as TestAttempt;
}

// ---------- Rekap (guru) ----------

export async function fetchAllAttempts(testType: TestType): Promise<TestAttemptWithStudent[]> {
  const { data, error } = await supabase
    .from("test_attempts")
    .select(
      "id, student_id, test_type, score, total_questions, correct_count, submitted_at, students(full_name)"
    )
    .eq("test_type", testType)
    .order("submitted_at", { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    id: row.id,
    student_id: row.student_id,
    test_type: row.test_type,
    score: row.score,
    total_questions: row.total_questions,
    correct_count: row.correct_count,
    submitted_at: row.submitted_at,
    student_name: row.students?.full_name ?? "Siswa",
  }));
}

export interface StudentNilaiSummary {
  student_id: number;
  student_name: string;
  class_name: string | null;
  /** Skor per jenis test, null kalau belum dikerjakan. */
  scores: Record<TestType, number | null>;
  /**
   * ID baris `test_attempts` per jenis test — dipakai buat tombol hapus
   * nilai spesifik (per sel) di Rekap Nilai. Null kalau belum ada attempt.
   */
  attemptIds: Record<TestType, number | null>;
}

/** Gabungan roster siswa asli + skor tiap jenis test, buat Rekap Nilai & Laporan. */
export async function fetchNilaiRekap(): Promise<StudentNilaiSummary[]> {
  const [studentsRes, ...attemptsByType] = await Promise.all([
    supabase.from("students").select("id, full_name, class_name").eq("active", true),
    ...TEST_TYPES.map((t) => fetchAllAttempts(t.type)),
  ]);

  const students = studentsRes.data ?? [];
  const scoreMaps = TEST_TYPES.map((t, i) => ({
    type: t.type,
    scoreByStudent: new Map(attemptsByType[i].map((a) => [a.student_id, a.score])),
    idByStudent: new Map(attemptsByType[i].map((a) => [a.student_id, a.id])),
  }));

  return students.map((s) => {
    const scores = {} as Record<TestType, number | null>;
    const attemptIds = {} as Record<TestType, number | null>;
    for (const { type, scoreByStudent, idByStudent } of scoreMaps) {
      scores[type] = scoreByStudent.get(s.id) ?? null;
      attemptIds[type] = idByStudent.get(s.id) ?? null;
    }
    return {
      student_id: s.id,
      student_name: s.full_name,
      class_name: s.class_name,
      scores,
      attemptIds,
    };
  });
}

/** Hapus satu nilai (1 attempt) spesifik — dipakai tombol hapus per sel di Rekap Nilai. */
export async function deleteAttempt(attemptId: number): Promise<void> {
  const { error } = await supabase.from("test_attempts").delete().eq("id", attemptId);
  if (error) throw new Error("Gagal menghapus nilai. Coba lagi.");
}

/**
 * Reset SEMUA nilai — hapus seluruh baris `test_attempts` (pretest +
 * posttest siklus 1/2/3, semua siswa). Dipakai tombol "Reset Semua Nilai".
 * Tidak menyentuh soal (`test_questions`) atau data siswa (`students`).
 */
export async function resetAllAttempts(): Promise<void> {
  // `.delete()` Supabase butuh filter, jadi pakai kondisi yang selalu benar
  // (id lebih besar dari 0) supaya semua baris ke-hapus.
  const { error } = await supabase.from("test_attempts").delete().gt("id", 0);
  if (error) throw new Error("Gagal reset nilai. Coba lagi.");
}