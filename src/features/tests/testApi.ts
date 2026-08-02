import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/features/auth/AuthContext";

export type TestType = "pretest" | "posttest";

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
  pretest_score: number | null;
  posttest_score: number | null;
}

/** Gabungan roster siswa asli + skor pretest/posttest, buat Rekap Nilai & Laporan. */
export async function fetchNilaiRekap(): Promise<StudentNilaiSummary[]> {
  const [studentsRes, pretestAttempts, posttestAttempts] = await Promise.all([
    supabase.from("students").select("id, full_name, class_name").eq("active", true),
    fetchAllAttempts("pretest"),
    fetchAllAttempts("posttest"),
  ]);

  const students = studentsRes.data ?? [];
  const pretestByStudent = new Map(pretestAttempts.map((a) => [a.student_id, a.score]));
  const posttestByStudent = new Map(posttestAttempts.map((a) => [a.student_id, a.score]));

  return students.map((s) => ({
    student_id: s.id,
    student_name: s.full_name,
    class_name: s.class_name,
    pretest_score: pretestByStudent.get(s.id) ?? null,
    posttest_score: posttestByStudent.get(s.id) ?? null,
  }));
}