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

// ---------- Import Soal Massal (guru) ----------

export interface ParsedBulkQuestion {
  question_text: string;
  options: string[];
  correct_index: number;
}

export interface BulkParseResult {
  questions: ParsedBulkQuestion[];
  errors: string[];
}

const OPTION_LINE_RE = /^([A-Ea-e])[.)]\s*(.*)$/;
const ANSWER_LINE_RE = /^(?:jawaban|kunci)\s*[:\-]?\s*([A-Ea-e])\b/i;
const NUMBERED_LINE_RE = /^\d+[.)]\s*(.*)$/;

/**
 * Parse teks soal pilihan ganda hasil paste guru jadi list soal terstruktur.
 * Format yang didukung per soal (bebas nomor pakai "." atau ")"):
 *
 *   1. Pertanyaan di sini?
 *   A. Opsi A
 *   B. Opsi B
 *   C. Opsi C
 *   D. Opsi D
 *   E. Opsi E
 *   JAWABAN: C
 *
 * Baris "JAWABAN"/"Kunci" (case-insensitive, boleh pakai ":" atau "-")
 * menutup satu soal. Soal yang gagal di-parse (opsi < 2, tidak ada
 * jawaban, atau huruf jawaban di luar jumlah opsi) dilaporkan lewat
 * `errors`, bukan bikin seluruh proses gagal — soal lain tetap jalan.
 */
export function parseBulkQuestions(raw: string): BulkParseResult {
  const lines = raw.split(/\r?\n/);
  const questions: ParsedBulkQuestion[] = [];
  const errors: string[] = [];

  let current: { text: string[]; options: string[]; correctLetter: string | null } | null = null;
  let qNumber = 0;

  const flush = () => {
    if (!current) return;
    qNumber += 1;
    const text = current.text.join(" ").trim();
    const preview = text.length > 40 ? `${text.slice(0, 40)}...` : text;

    if (!text) {
      errors.push(`Soal #${qNumber}: teks pertanyaan kosong, dilewati.`);
      current = null;
      return;
    }
    if (current.options.length < 2) {
      errors.push(`Soal #${qNumber} ("${preview}"): opsi jawaban kurang dari 2, dilewati.`);
      current = null;
      return;
    }
    if (!current.correctLetter) {
      errors.push(`Soal #${qNumber} ("${preview}"): tidak ada baris JAWABAN/KUNCI, dilewati.`);
      current = null;
      return;
    }
    const correctIndex = current.correctLetter.toUpperCase().charCodeAt(0) - 65;
    if (correctIndex < 0 || correctIndex >= current.options.length) {
      errors.push(
        `Soal #${qNumber} ("${preview}"): jawaban "${current.correctLetter}" di luar jumlah opsi (ada ${current.options.length}), dilewati.`
      );
      current = null;
      return;
    }
    questions.push({ question_text: text, options: current.options, correct_index: correctIndex });
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const answerMatch = line.match(ANSWER_LINE_RE);
    if (answerMatch && current) {
      current.correctLetter = answerMatch[1];
      flush();
      continue;
    }

    const optionMatch = line.match(OPTION_LINE_RE);
    if (optionMatch && current) {
      current.options.push(optionMatch[2].trim());
      continue;
    }

    const numberedMatch = line.match(NUMBERED_LINE_RE);
    if (numberedMatch) {
      if (current) flush(); // soal sebelumnya belum ada JAWABAN eksplisit -> dilaporkan sebagai error di flush
      current = { text: [numberedMatch[1].trim()], options: [], correctLetter: null };
      continue;
    }

    if (!current) {
      current = { text: [line], options: [], correctLetter: null };
    } else if (current.options.length === 0) {
      // Baris lanjutan pertanyaan yang panjangnya lebih dari 1 baris.
      current.text.push(line);
    } else {
      errors.push(`Baris tidak dikenali, diabaikan: "${line}"`);
    }
  }
  flush(); // tutup soal terakhir kalau ada sisa

  return { questions, errors };
}

/** Insert banyak soal sekaligus hasil `parseBulkQuestions`, nomor urut lanjut dari yang sudah ada. */
export async function bulkCreateQuestions(
  testType: TestType,
  items: ParsedBulkQuestion[]
): Promise<number> {
  if (items.length === 0) return 0;

  const existing = await fetchQuestions(testType);
  let nextOrder = existing.length > 0 ? Math.max(...existing.map((q) => q.order)) + 1 : 1;

  const rows = items.map((item) => ({
    test_type: testType,
    question_order: nextOrder++,
    question_text: item.question_text,
    options: item.options,
    correct_index: item.correct_index,
  }));

  const { error } = await supabase.from("test_questions").insert(rows);
  if (error) throw new Error("Gagal import soal: " + error.message);
  return rows.length;
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