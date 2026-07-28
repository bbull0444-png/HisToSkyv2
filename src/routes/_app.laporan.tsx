import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_app/laporan")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Penelitian</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan hasil penelitian penerapan model CIRC di kelas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { t: "Peningkatan Nilai", v: "+24%" },
          { t: "Partisipasi Diskusi", v: "88%" },
          { t: "Kepuasan Siswa", v: "4.6/5" },
        ].map((s) => (
          <Card key={s.t}>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">{s.t}</div>
              <div className="mt-1 text-3xl font-bold">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Temuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Penerapan model Cooperative Integrated Reading and Composition (CIRC) pada 8 pertemuan
            materi sejarah Indonesia menunjukkan peningkatan signifikan pada nilai posttest
            dibanding pretest.
          </p>
          <p>
            Siswa aktif berdiskusi pada tahap <strong>Discussion</strong> dan menghasilkan LKPD yang
            lebih terstruktur pada tahap <strong>Writing</strong>. Tahap <strong>Reflection</strong>{" "}
            membantu guru mengidentifikasi miskonsepsi lebih dini.
          </p>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Unduh Laporan (PDF)
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
});
