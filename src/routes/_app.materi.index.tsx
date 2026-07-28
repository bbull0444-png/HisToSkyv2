import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEETINGS } from "@/features/meetings/data";

export const Route = createFileRoute("/_app/materi/")({
  component: MateriIndex,
});

function MateriIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materi Pembelajaran</h1>
        <p className="text-sm text-muted-foreground">
          Pilih pertemuan untuk mulai belajar dengan alur CIRC.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => (
          <Link key={m.id} to="/materi/$id" params={{ id: String(m.id) }} className="group">
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <Badge variant={m.status === "published" ? "default" : "secondary"}>
                    {m.status === "published" ? "Tersedia" : "Segera"}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-muted-foreground">Pertemuan {m.id}</div>
                <div className="mt-1 line-clamp-2 text-base font-semibold">{m.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.subtitle}</div>
                <div className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                  Mulai belajar
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
