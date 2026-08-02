import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireGuru } from "@/lib/route-guards";
import { fetchNilaiRekap, TEST_TYPES } from "@/features/tests/testsApi";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/laporan")({
  beforeLoad: requireGuru,
  loader: async () => {
    // Pastikan sesi Supabase Auth guru sudah selesai di-restore dari
    // localStorage sebelum query jalan. Tanpa ini, pas hard refresh, loader
    // ini bisa nembak query duluan sebelum token guru terpasang di client,
    // jadi RLS nganggep request-nya anon dan hasilnya kosong.
    await supabase.auth.getSession();

    const [rows, { count: totalSiswa }, { data: reflectionRows }] = await Promise.all([
      fetchNilaiRekap(),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("reflections").select("student_id"),
    ]);

    const averages = TEST_TYPES.map((t) => ({
      type: t.type,
      label: t.label,
      avg: average(rows.map((r) => r.scores[t.type]).filter((v): v is number => v !== null)),
      done: rows.filter((r) => r.scores[t.type] !== null).length,
    }));

    const distinctReflectors = new Set((reflectionRows ?? []).map((r) => r.student_id)).size;

    return {
      totalSiswa: totalSiswa ?? 0,
      averages,
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
  const { totalSiswa, averages, distinctReflectors } = Route.useLoaderData();

  const avgPretest = averages.find((a) => a.type === "pretest")!.avg;
  // Bandingkan pretest dengan siklus posttest terakhir yang sudah ada datanya
  const lastPosttestWithData = [...averages].reverse().find((a) => a.type !== "pretest" && a.avg !== null);
  const peningkatanPct =
    avgPretest !== null && avgPretest > 0 && lastPosttestWithData?.avg != null
      ? Math.round(((lastPosttestWithData.avg - avgPretest) / avgPretest) * 100)
      : null;

  const partisipasiRefleksi = totalSiswa > 0 ? Math.round((distinctReflectors / totalSiswa) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Penelitian</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan hasil penelitian penerapan model CIRC di kelas — dihitung otomatis dari data
          asli, bukan contoh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {averages.map((a) => (
          <Card key={a.type}>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">{a.label}</div>
              <div className="mt-1 text-3xl font-bold">{a.avg ?? "-"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {a.done} dari {totalSiswa} siswa sudah mengerjakan
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Peningkatan Nilai</div>
            <div className="mt-1 text-3xl font-bold">
              {peningkatanPct !== null ? `${peningkatanPct >= 0 ? "+" : ""}${peningkatanPct}%` : "-"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {lastPosttestWithData
                ? `Pretest ${avgPretest} → ${lastPosttestWithData.label} ${lastPosttestWithData.avg}`
                : "Belum ada data pretest & posttest yang bisa dibandingkan"}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Temuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Dari {totalSiswa} siswa terdaftar,{" "}
            {averages.map((a, i) => (
              <span key={a.type}>
                {i > 0 && ", "}
                {a.done} siswa telah mengerjakan {a.label.toLowerCase()}
              </span>
            ))}
            .
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