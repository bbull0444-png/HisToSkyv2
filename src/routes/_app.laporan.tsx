import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireGuru } from "@/lib/route-guards";
import { fetchNilaiRekap } from "@/features/tests/testsApi";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/laporan")({
  beforeLoad: requireGuru,
  loader: async () => {
    const [rows, { count: totalSiswa }, { data: reflectionRows }] = await Promise.all([
      fetchNilaiRekap(),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("reflections").select("student_id"),
    ]);

    const pretestScores = rows.map((r) => r.pretest_score).filter((v): v is number => v !== null);
    const posttestScores = rows.map((r) => r.posttest_score).filter((v): v is number => v !== null);
    const avgPretest = average(pretestScores);
    const avgPosttest = average(posttestScores);

    const distinctReflectors = new Set((reflectionRows ?? []).map((r) => r.student_id)).size;

    return {
      totalSiswa: totalSiswa ?? 0,
      pretestDone: pretestScores.length,
      posttestDone: posttestScores.length,
      avgPretest,
      avgPosttest,
      distinctReflectors,
    };
  },
  component: LaporanPage,
});

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function LaporanPage() {
  const { totalSiswa, pretestDone, posttestDone, avgPretest, avgPosttest, distinctReflectors } =
    Route.useLoaderData();

  const peningkatan =
    avgPretest !== null && avgPosttest !== null ? avgPosttest - avgPretest : null;
  const peningkatanPct =
    peningkatan !== null && avgPretest && avgPretest > 0
      ? Math.round((peningkatan / avgPretest) * 100)
      : null;
  const partisipasiRefleksi =
    totalSiswa > 0 ? Math.round((distinctReflectors / totalSiswa) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Penelitian</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan hasil penelitian penerapan model CIRC di kelas — dihitung otomatis dari data
          asli, bukan contoh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Peningkatan Nilai</div>
            <div className="mt-1 text-3xl font-bold">
              {peningkatanPct !== null ? `${peningkatanPct >= 0 ? "+" : ""}${peningkatanPct}%` : "-"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {avgPretest !== null && avgPosttest !== null
                ? `Rata-rata pretest ${avgPretest} → posttest ${avgPosttest}`
                : "Belum ada data pretest & posttest"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Partisipasi Refleksi</div>
            <div className="mt-1 text-3xl font-bold">
              {partisipasiRefleksi !== null ? `${partisipasiRefleksi}%` : "-"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {distinctReflectors} dari {totalSiswa} siswa sudah mengirim refleksi
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Kepuasan Siswa</div>
            <div className="mt-1 text-3xl font-bold text-muted-foreground">-</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Belum ada survei kepuasan siswa
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Temuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Dari {totalSiswa} siswa terdaftar, {pretestDone} siswa telah mengerjakan pretest dan{" "}
            {posttestDone} siswa telah mengerjakan posttest.
            {avgPretest !== null && avgPosttest !== null && (
              <>
                {" "}
                Rata-rata skor meningkat dari {avgPretest} menjadi {avgPosttest}
                {peningkatanPct !== null && ` (${peningkatanPct >= 0 ? "+" : ""}${peningkatanPct}%)`}.
              </>
            )}
          </p>
          <p>
            {distinctReflectors} dari {totalSiswa} siswa ({partisipasiRefleksi ?? 0}%) sudah mengirim
            refleksi pembelajaran setidaknya satu kali.
          </p>
          <p className="text-xs text-muted-foreground">
            Ringkasan ini diperbarui otomatis mengikuti data yang masuk — belum mencakup metrik
            partisipasi diskusi atau kepuasan siswa karena fitur survei belum dibangun.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}