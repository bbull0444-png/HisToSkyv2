import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MEETINGS } from "@/features/meetings/data";

/**
 * Reusable teacher "management" page for LKPD / Quiz management.
 * Kept intentionally simple — each entity type just points to the
 * corresponding stage of a meeting.
 */
export function SimpleManagePage({
  title,
  description,
  entity,
}: {
  title: string;
  description: string;
  entity: "LKPD" | "Quiz";
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex h-full flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pertemuan {m.id}</span>
                <Badge variant="outline">{entity}</Badge>
              </div>
              <div className="mt-2 line-clamp-2 font-semibold">{m.title}</div>
              <div className="mt-auto flex gap-2 pt-4">
                <Button size="sm" variant="outline">
                  Lihat
                </Button>
                <Button size="sm">Edit {entity}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
