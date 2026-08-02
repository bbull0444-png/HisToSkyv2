import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireGuru } from "@/lib/route-guards";
import { fetchNilaiRekap, TEST_TYPES } from "@/features/tests/testsApi";

export const Route = createFileRoute("/_app/rekap-nilai")({
  beforeLoad: requireGuru,
  loader: async () => {
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
  const { rows } = Route.useLoaderData();
  const [search, setSearch] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Rekap Nilai</h1>
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
        <Button variant="outline" onClick={handleExportCsv} className="gap-1.5">
          <Download className="h-4 w-4" />
          Ekspor CSV
        </Button>
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
                  {TEST_TYPES.map((t) => (
                    <TableCell key={t.type} className="text-right">
                      {r.scores[t.type] ?? "-"}
                    </TableCell>
                  ))}
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