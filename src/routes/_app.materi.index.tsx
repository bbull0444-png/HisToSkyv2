import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEETINGS } from "@/features/meetings/data";
import { getMeetingProgressStatus } from "@/features/meetings/progress";

export const Route = createFileRoute("/_app/materi/")({
  component: MateriIndex,
});

function MateriIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materi Pembelajaran</h1>
        <p className="text-sm text-muted-foreground">
          Pilih pertemuan untuk mulai belajar dengan alur CIRC. Pertemuan berikutnya
          terbuka setelah pertemuan sebelumnya diselesaikan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => {
          const progress = getMeetingProgressStatus(m.id);
          const locked = progress === "locked";

          const actionLabel =
            progress === "completed"
              ? "Selesai"
              : progress === "in-progress"
                ? "Lanjutkan"
                : progress === "locked"
                  ? "Terkunci"
                  : "Mulai Belajar";

          return (
            <Card
              key={m.id}
              className={`h-full transition ${
                locked ? "opacity-60" : "hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              <CardContent className="flex h-full flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {locked ? <Lock className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  </div>
                  <Badge variant={m.status === "published" ? "default" : "secondary"}>
                    {m.status === "published" ? "Tersedia" : "Segera"}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-muted-foreground">Pertemuan {m.id}</div>
                <div className="mt-1 line-clamp-2 text-base font-semibold">{m.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.subtitle}</div>
                <div className="mt-auto pt-4">
                  <Button
                    className="w-full"
                    variant={progress === "completed" ? "outline" : "default"}
                    disabled={locked}
                    asChild={!locked}
                  >
                    {locked ? (
                      <span className="flex items-center justify-center gap-1">
                        <Lock className="h-4 w-4" />
                        {actionLabel}
                      </span>
                    ) : (
                      <Link to="/materi/$id" params={{ id: String(m.id) }}>
                        {progress === "completed" && <CheckCircle2 className="mr-1 h-4 w-4" />}
                        {actionLabel}
                        {progress !== "completed" && <ArrowRight className="ml-1 h-4 w-4" />}
                      </Link>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
