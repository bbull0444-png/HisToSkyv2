import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireGuru } from "@/lib/route-guards";
import { fetchNilaiRekap } from "@/features/tests/testsApi";

export const Route = createFileRoute("/_app/rekap-nilai")({
  beforeLoad: requireGuru,
  loader: async () => {
    const rows = await fetchNilaiRekap();
    return { rows };
  },
  component: RekapNilaiPage,
});

function RekapNilaiPage() {
  const { rows } = Route.useLoaderData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.student_name.toLowerCase().includes(q));
  }, [rows, search]);

  const avgPretest = average(rows.map((r) => r.pretest_score).filter(isNum));
  const avgPosttest = average(rows.map((r) => r.posttest_score).filter(isNum));

  const handleExportCsv = () => {
    const header = ["Nama", "Kelas", "Pretest", "Posttest", "Peningkatan"];
    const body = filtered.map((r) => [
      r.student_name,
      r.class_name ?? "-",
      r.pretest_score ?? "",
      r.posttest_score ?? "",
      r.pretest_score !== null && r.posttest_score !== null
        ? String(r.posttest_score - r.pretest_score)
        : "",
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
            Nilai pretest & posttest tiap siswa. Rata-rata kelas: pretest{" "}
            <strong>{avgPretest ?? "-"}</strong>, posttest <strong>{avgPosttest ?? "-"}</strong>.
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
          <CardTitle className="text-base">
            {filtered.length} siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Pretest</TableHead>
                <TableHead className="text-right">Posttest</TableHead>
                <TableHead className="text-right">Peningkatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.student_id}>
                  <TableCell className="font-medium">{r.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.class_name ?? "-"}</TableCell>
                  <TableCell className="text-right">{r.pretest_score ?? "-"}</TableCell>
                  <TableCell className="text-right">{r.posttest_score ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {r.pretest_score !== null && r.posttest_score !== null ? (
                      <span
                        className={
                          r.posttest_score - r.pretest_score >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }
                      >
                        {r.posttest_score - r.pretest_score >= 0 ? "+" : ""}
                        {r.posttest_score - r.pretest_score}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
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

function isNum(n: number | null): n is number {
  return n !== null;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}