import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireGuru } from "@/lib/route-guards";
import {
  fetchNilaiRekap,
  TEST_TYPES,
  type StudentNilaiSummary,
} from "@/features/tests/testsApi";
import {
  fetchIndicatorTables,
  fetchStudentIndicatorMap,
  type IndicatorTable,
  type StudentIndicatorMap,
} from "@/features/tests/indicatorStats";
import { INDICATORS } from "@/features/tests/indicatorMap";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/rekap-nilai")({
  beforeLoad: requireGuru,
  loader: async () => {
    // Pastikan sesi Supabase Auth guru sudah selesai di-restore dari
    // localStorage sebelum query jalan. `getSession()` di supabase-js v2
    // menunggu proses inisialisasi client kelar (termasuk baca token dari
    // storage) sebelum resolve. Tanpa ini, pas hard refresh, loader bisa
    // nembak query duluan sebelum token guru terpasang di client, jadi RLS
    // nganggep request-nya anon dan hasilnya kosong (kelihatan "0 siswa"
    // sampai pindah halaman lalu balik lagi).
    await supabase.auth.getSession();

    const [rows, { data: settings }, indicatorTables, studentIndicatorMap] =
      await Promise.all([
        fetchNilaiRekap(),
        supabase.from("settings").select("kkm").eq("id", 1).maybeSingle(),
        fetchIndicatorTables(),
        fetchStudentIndicatorMap(),
      ]);
    const kkm = typeof settings?.kkm === "number" ? settings.kkm : 75;
    return { rows, kkm, indicatorTables, studentIndicatorMap };
  },
  component: RekapNilaiPage,
});

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/** Format angka gaya akademik Indonesia (koma desimal), 2 angka di belakang koma. */
function fmt2(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "-";
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function median(sorted: number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Standar deviasi populasi (bukan sampel) — konsisten dengan cara hitung deskriptif di Bab IV. */
function stdDevPopulation(nums: number[], mean: number): number | null {
  if (nums.length === 0) return null;
  const variance = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

interface StageStat {
  type: string;
  label: string;
  n: number;
  mean: number | null;
  median: number | null;
  stdDev: number | null;
  min: number | null;
  max: number | null;
  tuntas: number;
  klasikalPct: number | null;
}

function computeStageStats(
  rows: StudentNilaiSummary[],
  totalSiswa: number,
  kkm: number,
): StageStat[] {
  return TEST_TYPES.map((t) => {
    const scored = rows
      .map((r) => r.scores[t.type])
      .filter((v): v is number => v !== null)
      .sort((a, b) => a - b);
    const n = scored.length;
    const mean = n > 0 ? scored.reduce((a, b) => a + b, 0) / n : null;
    const tuntas = rows.filter((r) => (r.scores[t.type] ?? -1) >= kkm).length;
    const klasikalPct = totalSiswa > 0 ? (tuntas / totalSiswa) * 100 : null;

    return {
      type: t.type,
      label: t.label,
      n,
      mean,
      median: median(scored),
      stdDev: mean !== null ? stdDevPopulation(scored, mean) : null,
      min: n > 0 ? scored[0] : null,
      max: n > 0 ? scored[n - 1] : null,
      tuntas,
      klasikalPct,
    };
  });
}

interface NGainStat {
  type: string;
  label: string;
  n: number;
  avgNGain: number | null;
  kategori: "Tinggi" | "Sedang" | "Rendah" | null;
}

/**
 * N-Gain (Hake) rata-rata Pretest -> tiap Posttest Siklus, hanya dihitung dari
 * siswa yang punya nilai pretest DAN posttest siklus itu (pasangan lengkap).
 * Siswa dengan pretest 100 dilewati (pembagi 100-pre jadi nol / tak terdefinisi).
 * Kategori standar Hake: g >= 0.7 Tinggi, 0.3 <= g < 0.7 Sedang, g < 0.3 Rendah.
 */
function computeNGainStats(rows: StudentNilaiSummary[]): NGainStat[] {
  return TEST_TYPES.filter((t) => t.type !== "pretest").map((t) => {
    const gains: number[] = [];
    for (const r of rows) {
      const pre = r.scores.pretest;
      const post = r.scores[t.type];
      if (pre === null || post === null || pre >= 100) continue;
      gains.push((post - pre) / (100 - pre));
    }
    const n = gains.length;
    const avgNGain = n > 0 ? gains.reduce((a, b) => a + b, 0) / n : null;
    const kategori =
      avgNGain === null ? null : avgNGain >= 0.7 ? "Tinggi" : avgNGain >= 0.3 ? "Sedang" : "Rendah";
    return { type: t.type, label: t.label, n, avgNGain, kategori };
  });
}

function RekapNilaiPage() {
  const {
    rows: initialRows,
    kkm,
    indicatorTables: initialIndicatorTables,
    studentIndicatorMap: initialStudentMap,
  } = Route.useLoaderData() as {
    rows: StudentNilaiSummary[];
    kkm: number;
    indicatorTables: IndicatorTable[];
    studentIndicatorMap: StudentIndicatorMap;
  };
  const [rows, setRows] = useState<StudentNilaiSummary[]>(initialRows);
  const [indicatorTables, setIndicatorTables] = useState<IndicatorTable[]>(
    initialIndicatorTables,
  );
  const [studentIndicatorMap, setStudentIndicatorMap] =
    useState<StudentIndicatorMap>(initialStudentMap);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(false);

  // Kalau loader jalan ulang (mis. navigasi masuk lagi ke route ini),
  // sinkronkan state lokal dengan data terbaru dari loader.
  useEffect(() => {
    setRows(initialRows);
    setIndicatorTables(initialIndicatorTables);
    setStudentIndicatorMap(initialStudentMap);
  }, [initialRows, initialIndicatorTables, initialStudentMap]);

  // Live update: dengerin perubahan di tabel `test_attempts` lewat Supabase
  // Realtime. Begitu ada siswa submit/nilai berubah, refetch rekap otomatis
  // tanpa perlu refresh manual. Perlu Realtime Replication diaktifkan untuk
  // tabel `test_attempts` di Supabase Dashboard (Database > Replication).
  useEffect(() => {
    const channel = supabase
      .channel("rekap-nilai-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_attempts" },
        async () => {
          const [fresh, freshIndicator, freshStudentMap] = await Promise.all([
            fetchNilaiRekap(),
            fetchIndicatorTables(),
            fetchStudentIndicatorMap(),
          ]);
          setRows(fresh);
          setIndicatorTables(freshIndicator);
          setStudentIndicatorMap(freshStudentMap);
        },
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.student_name.toLowerCase().includes(q));
  }, [rows, search]);

  const classAverages = TEST_TYPES.map((t) => ({
    label: t.label,
    avg: average(rows.map((r) => r.scores[t.type]).filter((v): v is number => v !== null)),
  }));

  const stageStats = useMemo(() => computeStageStats(rows, rows.length, kkm), [rows, kkm]);
  const nGainStats = useMemo(() => computeNGainStats(rows), [rows]);

  const handleExportCsv = () => {
    const lines: string[][] = [];

    // Section 1: Statistik Deskriptif
    lines.push(["Statistik Deskriptif per Tahap Tes (KKM " + kkm + ")"]);
    lines.push([
      "Tahap",
      "N",
      "Rata-rata",
      "Median",
      "SD",
      "Min",
      "Maks",
      "Tuntas",
      "Ketuntasan Klasikal %",
    ]);
    for (const s of stageStats) {
      lines.push([
        s.label,
        String(s.n),
        s.mean === null ? "-" : s.mean.toFixed(2).replace(".", ","),
        s.median === null ? "-" : s.median.toFixed(2).replace(".", ","),
        s.stdDev === null ? "-" : s.stdDev.toFixed(2).replace(".", ","),
        s.min === null ? "-" : String(s.min),
        s.max === null ? "-" : String(s.max),
        `${s.tuntas}/${rows.length}`,
        s.klasikalPct === null ? "-" : s.klasikalPct.toFixed(2).replace(".", ","),
      ]);
    }
    lines.push([]);

    // Section 2: N-Gain
    lines.push(["N-Gain Hake Pretest ke Posttest per Siklus"]);
    lines.push(["Siklus", "N pasangan lengkap", "Rata-rata N-Gain", "Kategori"]);
    for (const g of nGainStats) {
      lines.push([
        g.label,
        String(g.n),
        g.avgNGain === null ? "-" : g.avgNGain.toFixed(2).replace(".", ","),
        g.kategori ?? "-",
      ]);
    }
    lines.push([]);

    // Section 3: Capaian per Indikator (4 tahap x 3 indikator)
    lines.push(["Capaian per Indikator Historical Consciousness"]);
    lines.push(["Tahap", "Indikator", "Jumlah Butir", "Rata-rata Jawaban Benar", "Persentase Capaian %", "N"]);
    for (const tbl of indicatorTables) {
      for (const r of tbl.rows) {
        lines.push([
          tbl.label,
          `${r.code} ${r.label}`,
          String(r.jumlahButir),
          r.rataBenar === null ? "-" : r.rataBenar.toFixed(2).replace(".", ","),
          r.capaianPct === null ? "-" : r.capaianPct.toFixed(2).replace(".", ","),
          String(r.n),
        ]);
      }
    }
    lines.push([]);

    // Section 4: Rincian per Siswa
    lines.push(["Rincian per Siswa (skor total dan per indikator)"]);
    const rincianHeader = [
      "Nama",
      "Kelas",
      ...TEST_TYPES.flatMap((t) => [
        t.label,
        ...INDICATORS.map((ind) => `${t.label} ${ind.code} (0-4)`),
      ]),
    ];
    lines.push(rincianHeader);
    for (const r of filtered) {
      const row: string[] = [r.student_name, r.class_name ?? "-"];
      const det = studentIndicatorMap.get(r.student_id);
      for (const t of TEST_TYPES) {
        row.push(r.scores[t.type] === null ? "" : String(r.scores[t.type]));
        for (const ind of INDICATORS) {
          const d = det?.[t.type]?.[ind.code];
          row.push(d ? String(d.benar) : "");
        }
      }
      lines.push(row);
    }

    const csv = lines.map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-nilai-lengkap.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Rekap Nilai</h1>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <Radio className="h-3 w-3" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Rata-rata kelas:{" "}
            {classAverages.map((c, i) => (
              <span key={c.label}>
                {i > 0 && " · "}
                {c.label} <strong>{c.avg ?? "-"}</strong>
              </span>
            ))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} className="gap-1.5">
            <Download className="h-4 w-4" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistik Deskriptif per Tahap Tes</CardTitle>
          <p className="text-xs text-muted-foreground">
            Dihitung otomatis dari data asli di tabel ini (bukan input manual). KKM {kkm}.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tahap</TableHead>
                <TableHead className="text-right">N</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
                <TableHead className="text-right">Median</TableHead>
                <TableHead className="text-right">SD</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Maks</TableHead>
                <TableHead className="text-right">Tuntas (≥ KKM)</TableHead>
                <TableHead className="text-right">Ketuntasan Klasikal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageStats.map((s) => (
                <TableRow key={s.type}>
                  <TableCell className="font-medium">{s.label}</TableCell>
                  <TableCell className="text-right">{s.n}</TableCell>
                  <TableCell className="text-right">{fmt2(s.mean)}</TableCell>
                  <TableCell className="text-right">{fmt2(s.median)}</TableCell>
                  <TableCell className="text-right">{fmt2(s.stdDev)}</TableCell>
                  <TableCell className="text-right">{s.min ?? "-"}</TableCell>
                  <TableCell className="text-right">{s.max ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {s.tuntas} / {rows.length}
                  </TableCell>
                  <TableCell className="text-right">
                    {s.klasikalPct === null ? "-" : `${fmt2(s.klasikalPct)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 border-t pt-4">
            <div className="mb-2 text-sm font-medium">
              N-Gain (Hake) Pretest &rarr; Posttest per Siklus
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siklus</TableHead>
                  <TableHead className="text-right">N (pasangan lengkap)</TableHead>
                  <TableHead className="text-right">Rata-rata N-Gain</TableHead>
                  <TableHead>Kategori</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nGainStats.map((g) => (
                  <TableRow key={g.type}>
                    <TableCell className="font-medium">{g.label}</TableCell>
                    <TableCell className="text-right">{g.n}</TableCell>
                    <TableCell className="text-right">{fmt2(g.avgNGain)}</TableCell>
                    <TableCell>{g.kategori ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">
              N-Gain dihitung per siswa: (Posttest - Pretest) / (100 - Pretest), hanya untuk siswa
              yang punya nilai pretest dan posttest siklus tersebut. Kategori: g {"≥"} 0,7
              Tinggi; 0,3 {"≤"} g {"<"} 0,7 Sedang; g {"<"} 0,3 Rendah.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capaian per Indikator Historical Consciousness (additive only, sesuai Supabase) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Capaian per Indikator Historical Consciousness
          </h2>
          <p className="text-xs text-muted-foreground">
            Dihitung otomatis dari jawaban per butir dikali kunci per butir.
            Tiap indikator 4 butir sesuai Tabel 3.12 sampai 3.14 BAB 3. Rata-rata
            jawaban benar adalah rerata benar per indikator 0 sampai 4.
            Persentase capaian adalah rata dibagi 4 dikali 100 persen.
          </p>
        </div>
        {indicatorTables.map((tbl) => (
          <Card key={tbl.testType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Capaian {tbl.label} per Indikator Historical Consciousness
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                N = {tbl.rows[0]?.n ?? 0} siswa (yang punya jawaban lengkap untuk
                tahap ini)
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indikator</TableHead>
                    <TableHead className="text-right">Jumlah Butir</TableHead>
                    <TableHead className="text-right">
                      Rata-rata Jawaban Benar
                    </TableHead>
                    <TableHead className="text-right">Persentase Capaian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tbl.rows.map((r, i) => (
                    <TableRow key={r.code}>
                      <TableCell>
                        {i + 1}. {r.label}
                      </TableCell>
                      <TableCell className="text-right">{r.jumlahButir}</TableCell>
                      <TableCell className="text-right">
                        {r.rataBenar === null
                          ? "-"
                          : r.rataBenar.toLocaleString("id-ID", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.capaianPct === null
                          ? "-"
                          : `${r.capaianPct.toLocaleString("id-ID", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input
        placeholder="Cari nama siswa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} siswa</CardTitle>
          <p className="text-xs text-muted-foreground">
            Klik baris siswa untuk melihat jawaban benar per nomor soal per indikator. Satu baris terbuka dalam satu waktu.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                {TEST_TYPES.map((t) => (
                  <TableHead key={t.type} className="text-right">
                    {t.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const isExpanded = expandedId === r.student_id;
                const det = studentIndicatorMap.get(r.student_id);
                return (
                  <>
                    <TableRow
                      key={r.student_id}
                      className={`cursor-pointer ${isExpanded ? "bg-muted/50" : ""}`}
                      onClick={() => setExpandedId(isExpanded ? null : r.student_id)}
                    >
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs ${isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                          >
                            {isExpanded ? "-" : "+"}
                          </span>
                          {r.student_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.class_name ?? "-"}</TableCell>
                      {TEST_TYPES.map((t) => {
                        const score = r.scores[t.type];
                        const isTuntas = score !== null && score >= kkm;
                        return (
                          <TableCell key={t.type} className="text-right">
                            {score === null ? (
                              "-"
                            ) : (
                              <span className="inline-flex items-center justify-end gap-1">
                                {score}
                                {isTuntas && (
                                  <CheckCircle2
                                    className="h-3.5 w-3.5 text-emerald-500"
                                    aria-label={`Tuntas (>= KKM ${kkm})`}
                                  />
                                )}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${r.student_id}-detail`}>
                        <TableCell colSpan={2 + TEST_TYPES.length} className="bg-muted/30 p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            {TEST_TYPES.map((t) => {
                              const hasAny = INDICATORS.some((ind) => det?.[t.type]?.[ind.code]);
                              return (
                                <div key={t.type} className="rounded border bg-card p-2">
                                  <div className="mb-1 text-xs font-semibold">
                                    {t.label} {r.scores[t.type] !== null ? `(skor ${r.scores[t.type]})` : "(belum)"}
                                  </div>
                                  {!hasAny ? (
                                    <p className="text-xs text-muted-foreground">Belum ada jawaban lengkap</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {INDICATORS.map((ind) => {
                                        const d = det?.[t.type]?.[ind.code];
                                        if (!d) return null;
                                        return (
                                          <div key={ind.code} className="text-xs">
                                            <div className="font-medium">
                                              {ind.code} {ind.label}: {d.benar}/{d.jumlahButir}
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap gap-1">
                                              {d.flags.map((f) => (
                                                <span
                                                  key={f.order}
                                                  className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs ${f.correct ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
                                                >
                                                  No {f.order} {f.correct ? "benar" : "salah"}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2 + TEST_TYPES.length}
                    className="text-center text-muted-foreground"
                  >
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
