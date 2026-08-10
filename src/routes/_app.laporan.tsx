import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

    const [rows, { count: countStudents }, { data: reflectionRows }, { data: settings }] =
      await Promise.all([
        fetchNilaiRekap(),
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("reflections").select("student_id"),
        supabase.from("settings").select("kkm").eq("id", 1).maybeSingle(),
      ]);

    // KKM dibaca dari tabel settings (bisa diubah guru di halaman Pengaturan),
    // bukan hardcode di kode. Default kalau kolom belum terisi: 75.
    const kkm = typeof settings?.kkm === "number" ? settings.kkm : 75;
    const targetKlasikalPct = 80; // target ketuntasan klasikal standar PTK
    const totalSiswa = countStudents ?? 0;

    // Per siklus: rata-rata, jumlah siswa mengerjakan, jumlah tuntas (≥ KKM),
    // dan % ketuntasan klasikal (siswa tuntas / total siswa).
    const cycles = TEST_TYPES.map((t) => {
      const scored = rows.map((r) => r.scores[t.type]).filter((v): v is number => v !== null);
      const avg =
        scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null;
      const done = scored.length;
      const tuntas = rows.filter((r) => (r.scores[t.type] ?? -1) >= kkm).length;
      const klasikal = totalSiswa > 0 ? Math.round((tuntas / totalSiswa) * 100) : null;
      const isTuntas = klasikal !== null && klasikal >= targetKlasikalPct;
      // Berapa siswa lagi yang perlu tuntas (nilai >= KKM) supaya ketuntasan
      // klasikal siklus ini mencapai target — buat progres "kurang X siswa".
      const kurangSiswa =
        klasikal !== null && !isTuntas
          ? Math.max(0, Math.ceil((targetKlasikalPct / 100) * totalSiswa) - tuntas)
          : 0;

      return {
        type: t.type,
        label: t.label,
        avg,
        done,
        tuntas,
        klasikal,
        isTuntas,
        kurangSiswa,
      };
    });

    const avgPretest = cycles.find((c) => c.type === "pretest")?.avg ?? null;
    // Bandingkan pretest dengan siklus posttest terakhir yang sudah ada datanya.
    const lastPosttestWithData = [...cycles]
      .reverse()
      .find((c) => c.type !== "pretest" && c.avg !== null);
    const peningkatanPct =
      avgPretest !== null && avgPretest > 0 && lastPosttestWithData?.avg != null
        ? Math.round(((lastPosttestWithData.avg - avgPretest) / avgPretest) * 100)
        : null;

    const distinctReflectors = new Set((reflectionRows ?? []).map((r) => r.student_id)).size;
    const partisipasiRefleksi =
      totalSiswa > 0 ? Math.round((distinctReflectors / totalSiswa) * 100) : null;

    return {
      kkm,
      targetKlasikalPct,
      totalSiswa,
      cycles,
      avgPretest,
      lastPosttestLabel: lastPosttestWithData?.label ?? null,
      peningkatanPct,
      distinctReflectors,
      partisipasiRefleksi,
    };
  },
  component: LaporanPage,
});

function LaporanPage() {
  const {
    kkm,
    targetKlasikalPct,
    totalSiswa,
    cycles,
    avgPretest,
    lastPosttestLabel,
    peningkatanPct,
    distinctReflectors,
    partisipasiRefleksi,
  } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Penelitian</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan hasil penelitian penerapan model CIRC di kelas — dihitung otomatis dari data
          asli. KKM {kkm}, target ketuntasan klasikal {targetKlasikalPct}%.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cycles.map((c) => (
          <Card key={c.type}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">{c.label}</div>
                {c.done > 0 && (
                  <Badge
                    variant={c.isTuntas ? "default" : "outline"}
                    className={
                      c.isTuntas
                        ? "gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
                        : "gap-1 text-amber-600 dark:text-amber-400"
                    }
                  >
                    {c.isTuntas ? "Tuntas" : "Belum"}
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-3xl font-bold">{c.avg ?? "-"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {c.tuntas} dari {totalSiswa} siswa tuntas (≥ {kkm})
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Ketuntasan klasikal: <strong>{c.klasikal ?? "-"}%</strong>
              </div>
              {c.klasikal !== null && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        c.isTuntas ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-500"
                      }
                      style={{ width: `${Math.min(100, c.klasikal)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {c.isTuntas
                      ? `Target ${targetKlasikalPct}% sudah tercapai`
                      : `Butuh ${c.kurangSiswa} siswa lagi (+${targetKlasikalPct - c.klasikal}%) untuk capai target ${targetKlasikalPct}%`}
                  </div>
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                {c.done} siswa sudah mengerjakan
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
              {peningkatanPct !== null
                ? `${peningkatanPct >= 0 ? "+" : ""}${peningkatanPct}%`
                : "-"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {lastPosttestLabel
                ? `Pretest ${avgPretest} → ${lastPosttestLabel} (rata-rata)`
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
            Dari {totalSiswa} siswa terdaftar di kelas, pada setiap tahap tercatat:{" "}
            {cycles.map((c, i) => (
              <span key={c.type}>
                {i > 0 && ", "}
                <strong>{c.label}</strong> rata-rata {c.avg ?? "-"}, {c.tuntas} tuntas (
                {c.klasikal ?? 0}%)
              </span>
            ))}
            .
          </p>
          <p>
            Kenaikan rata-rata dari pretest{" "}
            {peningkatanPct !== null
              ? `adalah ${peningkatanPct >= 0 ? "+" : ""}${peningkatanPct}% ${lastPosttestLabel}`
              : "belum dapat dihitung (butuh data pretest & posttest)"}
            .
          </p>
          <p>
            {distinctReflectors} dari {totalSiswa} siswa ({partisipasiRefleksi ?? 0}%) sudah
            mengirim refleksi pembelajaran setidaknya satu kali.
          </p>
          <p className="text-xs text-muted-foreground">
            Ketuntasan klasikal dihitung dari jumlah siswa yang mencapai KKM ({kkm}) dibagi total
            siswa. Satu tahap dianggap <strong>Tuntas</strong> bila ketuntasan klasikalnya {">="}{" "}
            {targetKlasikalPct}%. Ringkasan diperbarui otomatis mengikuti data yang masuk.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
