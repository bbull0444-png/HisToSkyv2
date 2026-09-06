import { supabase } from "@/lib/supabase";
import { INDICATOR_MAP, INDICATORS, type IndicatorCode } from "./indicatorMap";
import type { TestType } from "./testsApi";

export interface IndicatorRow {
  code: IndicatorCode;
  label: string;
  jumlahButir: number;
  rataBenar: number | null; // 0..4
  capaianPct: number | null; // 0..100
  n: number; // jumlah siswa yang punya attempt dengan answers lengkap
}

export interface IndicatorTable {
  testType: TestType;
  label: string;
  rows: IndicatorRow[];
}

/**
 * Ambil semua questions (id, test_type, question_order, correct_index)
 * dan semua attempts (student_id, test_type, answers) lalu hitung
 * rata-rata jawaban benar per indikator.
 *
 * Hanya attempts yang punya answers lengkap 12 kunci yang dihitung.
 * Sudah terbukti terisi untuk 38 siswa via supabase query.
 */
export async function fetchIndicatorTables(): Promise<IndicatorTable[]> {
  const [questionsRes, attemptsRes] = await Promise.all([
    supabase
      .from("test_questions")
      .select("id, test_type, question_order, correct_index"),
    supabase.from("test_attempts").select("student_id, test_type, answers"),
  ]);

  const questions = (questionsRes.data ?? []) as {
    id: number;
    test_type: TestType;
    question_order: number;
    correct_index: number;
  }[];
  const attempts = (attemptsRes.data ?? []) as {
    student_id: number;
    test_type: TestType;
    answers: Record<string, number> | null;
  }[];

  // order -> {id, correct_index} per test_type
  const orderMap = new Map<string, { id: number; correct: number }>();
  const idToOrder = new Map<number, number>();
  for (const q of questions) {
    orderMap.set(`${q.test_type}:${q.question_order}`, {
      id: q.id,
      correct: q.correct_index,
    });
    idToOrder.set(q.id, q.question_order);
  }

  const testTypes: TestType[] = [
    "pretest",
    "posttest_siklus_1",
    "posttest_siklus_2",
    "posttest_siklus_3",
  ];
  const labelMap: Record<TestType, string> = {
    pretest: "Pretest",
    posttest_siklus_1: "Posttest Siklus I",
    posttest_siklus_2: "Posttest Siklus II",
    posttest_siklus_3: "Posttest Siklus III",
  };

  const result: IndicatorTable[] = [];

  for (const testType of testTypes) {
    const attemptsForType = attempts.filter((a) => a.test_type === testType);
    const rows: IndicatorRow[] = [];

    for (const ind of INDICATORS) {
      const orders = INDICATOR_MAP[testType][ind.code];
      const jumlahButir = orders.length;

      // kumpulkan skor per siswa untuk indikator ini (0..jumlahButir)
      const scores: number[] = [];

      for (const att of attemptsForType) {
        const ans = att.answers as Record<string, number> | null;
        if (!ans || typeof ans !== "object" || Object.keys(ans).length === 0) continue;

        let benar = 0;
        let valid = true;
        for (const order of orders) {
          const entry = orderMap.get(`${testType}:${order}`);
          if (!entry) {
            valid = false;
            break;
          }
          // S3 menyimpan answers dengan key berupa question_order 1 sampai 12,
          // sementara pretest/S1/S2 menyimpan key berupa question id.
          // Dukung keduanya agar hitungan tetap benar.
          const chosenById = ans[String(entry.id)];
          const chosenByOrder = ans[String(order)];
          const chosen =
            chosenById !== undefined ? chosenById : chosenByOrder;
          if (chosen === undefined || chosen === null) {
            valid = false;
            break;
          }
          if (chosen === entry.correct) benar += 1;
        }
        if (!valid) continue;
        scores.push(benar);
      }

      const n = scores.length;
      const rataBenar = n > 0 ? scores.reduce((a, b) => a + b, 0) / n : null;
      const capaianPct =
        rataBenar !== null ? (rataBenar / jumlahButir) * 100 : null;

      rows.push({
        code: ind.code,
        label: ind.label,
        jumlahButir,
        rataBenar,
        capaianPct,
        n,
      });
    }

    result.push({ testType, label: labelMap[testType], rows });
  }

  return result;
}

/** Hitung rata-rata jawaban benar dan capaian dari rows untuk preview tanpa fetch. */
export function calcIndicatorFromScores(
  testType: TestType,
  code: IndicatorCode,
  correctByOrder: Map<number, number>,
  answersByQuestionId: Record<string, number>,
  orderToId: Map<number, number>,
): number | null {
  const orders = INDICATOR_MAP[testType][code];
  let benar = 0;
  for (const o of orders) {
    const qid = orderToId.get(o);
    if (qid === undefined) return null;
    const chosen = answersByQuestionId[String(qid)];
    const correct = correctByOrder.get(o);
    if (chosen === undefined || correct === undefined) return null;
    if (chosen === correct) benar += 1;
  }
  return benar;
}

export interface StudentIndicatorDetail {
  benar: number;
  jumlahButir: number;
  flags: { order: number; correct: boolean }[];
}

export type StudentIndicatorMap = Map<
  number,
  Record<TestType, Record<IndicatorCode, StudentIndicatorDetail | null>>
>;

export async function fetchStudentIndicatorMap(): Promise<StudentIndicatorMap> {
  const [questionsRes, attemptsRes] = await Promise.all([
    supabase
      .from("test_questions")
      .select("id, test_type, question_order, correct_index"),
    supabase.from("test_attempts").select("student_id, test_type, answers"),
  ]);

  const questions = (questionsRes.data ?? []) as {
    id: number;
    test_type: TestType;
    question_order: number;
    correct_index: number;
  }[];
  const attempts = (attemptsRes.data ?? []) as {
    student_id: number;
    test_type: TestType;
    answers: Record<string, number> | null;
  }[];

  const orderMap = new Map<string, { id: number; correct: number }>();
  for (const q of questions) {
    orderMap.set(`${q.test_type}:${q.question_order}`, {
      id: q.id,
      correct: q.correct_index,
    });
  }

  const map: StudentIndicatorMap = new Map();

  const ensure = (sid: number) => {
    if (!map.has(sid)) {
      map.set(sid, {
        pretest: { I1: null, I2: null, I3: null },
        posttest_siklus_1: { I1: null, I2: null, I3: null },
        posttest_siklus_2: { I1: null, I2: null, I3: null },
        posttest_siklus_3: { I1: null, I2: null, I3: null },
      });
    }
    return map.get(sid)!;
  };

  for (const att of attempts) {
    const ans = att.answers as Record<string, number> | null;
    if (!ans || typeof ans !== "object" || Object.keys(ans).length === 0) continue;
    const rec = ensure(att.student_id);
    for (const ind of INDICATORS) {
      const orders = INDICATOR_MAP[att.test_type][ind.code];
      let benar = 0;
      const flags: { order: number; correct: boolean }[] = [];
      let valid = true;
      for (const order of orders) {
        const entry = orderMap.get(`${att.test_type}:${order}`);
        if (!entry) {
          valid = false;
          break;
        }
        const chosenById = ans[String(entry.id)];
        const chosenByOrder = ans[String(order)];
        const chosen = chosenById !== undefined ? chosenById : chosenByOrder;
        if (chosen === undefined || chosen === null) {
          valid = false;
          break;
        }
        const isCorrect = chosen === entry.correct;
        if (isCorrect) benar += 1;
        flags.push({ order, correct: isCorrect });
      }
      if (!valid) {
        rec[att.test_type][ind.code] = null;
      } else {
        rec[att.test_type][ind.code] = {
          benar,
          jumlahButir: orders.length,
          flags,
        };
      }
    }
  }

  return map;
}
