import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireGuru } from "@/lib/route-guards";
import { fetchAllReflectionsForTeacher } from "@/features/reflections/reflections";

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
  const { reflections } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refleksi Siswa</h1>
        <p className="text-sm text-muted-foreground">Kumpulan refleksi dari siswa per pertemuan.</p>
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