import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MEETINGS } from "@/features/meetings/data";
import { requireGuru } from "@/lib/route-guards";

// PENTING: path diakhiri "/" -> ini yang membuatnya jadi INDEX route
// (sibling dari $id, bukan parent-nya)
export const Route = createFileRoute("/_app/kelola-materi/")({
  beforeLoad: requireGuru,
  component: KelolaMateri,
});

function KelolaMateri() {
  const [statuses, setStatuses] = useState(
    () =>
      Object.fromEntries(MEETINGS.map((m) => [m.id, m.status])) as Record<
        number,
        "published" | "draft"
      >,
  );

  const toggle = (id: number) =>
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "published" ? "draft" : "published",
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Materi</h1>
        <p className="text-sm text-muted-foreground">
          Atur ketersediaan 8 pertemuan pembelajaran CIRC.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => {
          const status = statuses[m.id];
          return (
            <Card key={m.id}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pertemuan {m.id}
                  </span>
                  <Badge variant={status === "published" ? "default" : "secondary"}>
                    {status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="mt-2 line-clamp-2 font-semibold">{m.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.subtitle}</div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/materi/$id" params={{ id: String(m.id) }}>
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Lihat
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/kelola-materi/$id" params={{ id: String(m.id) }}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant={status === "published" ? "secondary" : "default"}
                    onClick={() => toggle(m.id)}
                  >
                    {status === "published" ? "Jadikan Draft" : "Publish"}
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