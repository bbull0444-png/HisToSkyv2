import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dummy = [
  {
    name: "Aisyah",
    meeting: 3,
    text: "Saya jadi paham motif VOC menerapkan monopoli.",
    date: "2 jam lalu",
  },
  { name: "Budi", meeting: 2, text: "Masih bingung bedanya hongi dan oktroi.", date: "5 jam lalu" },
  {
    name: "Citra",
    meeting: 4,
    text: "Politik Etis ternyata punya sisi ganda.",
    date: "1 hari lalu",
  },
  {
    name: "Dimas",
    meeting: 1,
    text: "3G itu ringkas tapi menjelaskan banyak hal.",
    date: "2 hari lalu",
  },
];

export const Route = createFileRoute("/_app/refleksi")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refleksi Siswa</h1>
        <p className="text-sm text-muted-foreground">Kumpulan refleksi dari siswa per pertemuan.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dummy.map((r, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{r.name}</span>
                <Badge variant="outline">Pertemuan {r.meeting}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">"{r.text}"</p>
              <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),
});
