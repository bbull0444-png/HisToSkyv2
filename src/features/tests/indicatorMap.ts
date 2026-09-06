import type { TestType } from "./testsApi";

/**
 * Mapping nomor soal (question_order) ke indikator HC
 * sesuai BAB 3 Tabel 3.12, 3.13, 3.14.
 *
 * I1 = Kemampuan menghubungkan masa lalu, masa kini, masa depan
 * I2 = Kemampuan memahami relevansi sejarah
 * I3 = Kemampuan mengambil nilai & merefleksikan makna
 *
 * Tiap test_type: 12 butir, 4 butir per indikator.
 */
export type IndicatorCode = "I1" | "I2" | "I3";

export interface IndicatorDef {
  code: IndicatorCode;
  label: string;
  shortLabel: string;
}

export const INDICATORS: IndicatorDef[] = [
  {
    code: "I1",
    label: "Keterhubungan masa lalu, masa kini, masa depan",
    shortLabel: "I1",
  },
  {
    code: "I2",
    label: "Relevansi peristiwa sejarah",
    shortLabel: "I2",
  },
  {
    code: "I3",
    label: "Nilai dan makna peristiwa sejarah",
    shortLabel: "I3",
  },
];

/**
 * Tabel 3.12 – Pretest & Posttest Siklus I (materi Jalur Rempah)
 *  A: I1=1,11 | I2=10 | I3=3
 *  B: I1=4    | I2=2,5 | I3=6
 *  C: I1=7    | I2=8   | I3=9,12
 */
const MAP_PRETEST_S1: Record<IndicatorCode, number[]> = {
  I1: [1, 4, 7, 11],
  I2: [2, 5, 8, 10],
  I3: [3, 6, 9, 12],
};

/**
 * Tabel 3.13 – Posttest Siklus II
 *  A: I1=1,4 | I2=- | I3=3
 *  B: I1=11  | I2=2 | I3=-
 *  C: I1=-   | I2=12| I3=6
 *  D: I1=7   | I2=5,8| I3=9,10
 */
const MAP_S2: Record<IndicatorCode, number[]> = {
  I1: [1, 4, 7, 11],
  I2: [2, 5, 8, 12],
  I3: [3, 6, 9, 10],
};

/**
 * Tabel 3.14 – Posttest Siklus III
 *  A: I1=2,7 | I2=1 | I3=3
 *  B: I1=4   | I2=10| I3=-
 *  C: I1=11  | I2=8 | I3=5,6
 *  D: I1=-   | I2=12| I3=9
 */
const MAP_S3: Record<IndicatorCode, number[]> = {
  I1: [2, 4, 7, 11],
  I2: [1, 8, 10, 12],
  I3: [3, 5, 6, 9],
};

export const INDICATOR_MAP: Record<TestType, Record<IndicatorCode, number[]>> = {
  pretest: MAP_PRETEST_S1,
  posttest_siklus_1: MAP_PRETEST_S1,
  posttest_siklus_2: MAP_S2,
  posttest_siklus_3: MAP_S3,
};
