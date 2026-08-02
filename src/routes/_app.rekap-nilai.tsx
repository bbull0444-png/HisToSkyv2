import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Radio, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { requireGuru } from "@/lib/route-guards";
import {
  fetchNilaiRekap,
  deleteAttempt,
  resetAllAttempts,
  TEST_TYPES,
  type StudentNilaiSummary,
} from "@/features/tests/testsApi";
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

    const rows = await fetchNilaiRekap();
    return { rows };
  },
  component: RekapNilaiPage,
});

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function RekapNilaiPage() {
  const { rows: initialRows } = Route.useLoaderData();
  const [rows, setRows] = useState<StudentNilaiSummary[]>(initialRows);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);

  // Kalau loader jalan ulang (mis. navigasi masuk lagi ke route ini),
  // sinkronkan state lokal dengan data terbaru dari loader.
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

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
          const fresh = await fetchNilaiRekap();
          setRows(fresh);
        }
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

  const handleExportCsv = () => {
    const header = ["Nama", "Kelas", ...TEST_TYPES.map((t) => t.label)];
    const body = filtered.map((r) => [
      r.student_name,
      r.class_name ?? "-",
      ...TEST_TYPES.map((t) => r.scores[t.type] ?? ""),
    ]);
    const csv = [header, ...body].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-nilai.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAttempt = async (attemptId: number) => {
    setDeletingId(attemptId);
    try {
      await deleteAttempt(attemptId);
      // Realtime channel di bawah bakal refetch otomatis, tapi update state
      // lokal langsung juga biar kelihatan instan (gak nunggu roundtrip).
      const fresh = await fetchNilaiRekap();
      setRows(fresh);
      toast.success("Nilai dihapus");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus nilai");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetAll = async () => {
    setResetting(true);
    try {
      await resetAllAttempts();
      const fresh = await fetchNilaiRekap();
      setRows(fresh);
      toast.success("Semua nilai berhasil direset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal reset nilai");
    } finally {
      setResetting(false);
    }
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={resetting} className="gap-1.5">
                <Trash2 className="h-4 w-4" />
                {resetting ? "Mereset..." : "Reset Semua Nilai"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset semua nilai?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ini akan menghapus SEMUA nilai Pretest, Posttest Siklus 1, 2, dan 3 dari SEMUA
                  siswa. Soal dan data siswa tidak terhapus, cuma nilainya. Tindakan ini tidak bisa
                  dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Ya, Reset Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
        </CardHeader>
        <CardContent>
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
              {filtered.map((r) => (
                <TableRow key={r.student_id}>
                  <TableCell className="font-medium">{r.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.class_name ?? "-"}</TableCell>
                  {TEST_TYPES.map((t) => {
                    const score = r.scores[t.type];
                    const attemptId = r.attemptIds[t.type];
                    return (
                      <TableCell key={t.type} className="text-right">
                        {score === null || attemptId === null ? (
                          "-"
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span>{score}</span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                  disabled={deletingId === attemptId}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus nilai ini?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Nilai {t.label} milik {r.student_name} ({score}) akan dihapus.
                                    Siswa jadi bisa mengerjakan ulang test ini. Tindakan ini tidak
                                    bisa dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAttempt(attemptId)}>
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2 + TEST_TYPES.length} className="text-center text-muted-foreground">
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