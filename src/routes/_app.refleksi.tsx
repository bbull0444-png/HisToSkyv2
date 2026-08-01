import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireGuru } from "@/lib/route-guards";
import {
  fetchAllReflectionsForTeacher,
  type ReflectionWithStudent,
} from "@/features/reflections/reflections";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/refleksi")({
  beforeLoad: requireGuru,
  loader: async () => {
    const reflections = await fetchAllReflectionsForTeacher();
    return { reflections };
  },
  component: RefleksiPage,
});

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function RefleksiPage() {
  const { reflections: initialReflections } = Route.useLoaderData();
  const [reflections, setReflections] = useState<ReflectionWithStudent[]>(initialReflections);

  useEffect(() => {
    // Live-update: begitu siswa manapun menulis/hapus refleksi, halaman
    // ini otomatis refresh tanpa guru perlu pindah/reload halaman.
    // Payload realtime cuma kasih baris mentah (tanpa nama siswa hasil
    // join), jadi cara paling aman & sederhana adalah fetch ulang daftar
    // lengkap tiap kali ada perubahan — bukan nge-patch satu baris manual.
    const channel = supabase
      .channel("reflections-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reflections" },
        () => {
          fetchAllReflectionsForTeacher().then(setReflections);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refleksi Siswa</h1>
        <p className="text-sm text-muted-foreground">
          Kumpulan refleksi dari siswa per pertemuan — diperbarui otomatis secara live.
        </p>
      </div>
      {reflections.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada refleksi yang dikirim siswa.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reflections.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{r.student_name}</span>
                  <Badge variant="outline">Pertemuan {r.meeting_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">"{r.content}"</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatRelative(r.updated_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}