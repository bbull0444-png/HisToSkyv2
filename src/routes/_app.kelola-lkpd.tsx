import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MEETINGS } from "@/features/meetings/data";
import { toast } from "sonner";
import { requireGuru } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/kelola-lkpd")({
  beforeLoad: requireGuru,
  component: KelolaLkpd,
});

type LkpdDraft = { title: string; instruction: string; deadline: string };

function KelolaLkpd() {
  const [drafts, setDrafts] = useState<Record<number, LkpdDraft>>(() =>
    Object.fromEntries(
      MEETINGS.map((m) => [
        m.id,
        { title: `LKPD Pertemuan ${m.id}`, instruction: m.writing, deadline: "" },
      ]),
    ),
  );
  const [openId, setOpenId] = useState<number | null>(null);
  const editing = openId ? drafts[openId] : null;

  const save = () => {
    if (!openId || !editing) return;
    setDrafts((prev) => ({ ...prev, [openId]: editing }));
    toast.success(`LKPD Pertemuan ${openId} disimpan`);
    setOpenId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola LKPD</h1>
        <p className="text-sm text-muted-foreground">
          Susun instruksi LKPD, tenggat, dan tinjau setiap pertemuan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MEETINGS.map((m) => {
          const d = drafts[m.id];
          return (
            <Card key={m.id}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pertemuan {m.id}
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <ClipboardList className="h-3 w-3" /> LKPD
                  </Badge>
                </div>
                <div className="mt-2 line-clamp-2 font-semibold">{d.title}</div>
                <div className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                  {d.instruction}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Tenggat: {d.deadline || "—"}
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/materi/$id" params={{ id: String(m.id) }}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Lihat
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => setOpenId(m.id)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit LKPD
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit LKPD Pertemuan {openId}</DialogTitle>
            <DialogDescription>
              Perbarui judul, instruksi, dan tenggat pengumpulan LKPD.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lkpd-title">Judul</Label>
                <Input
                  id="lkpd-title"
                  value={editing.title}
                  onChange={(e) =>
                    setDrafts((p) => ({ ...p, [openId!]: { ...editing, title: e.target.value } }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lkpd-instr">Instruksi</Label>
                <Textarea
                  id="lkpd-instr"
                  rows={6}
                  value={editing.instruction}
                  onChange={(e) =>
                    setDrafts((p) => ({
                      ...p,
                      [openId!]: { ...editing, instruction: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lkpd-deadline">Tenggat</Label>
                <Input
                  id="lkpd-deadline"
                  type="date"
                  value={editing.deadline}
                  onChange={(e) =>
                    setDrafts((p) => ({
                      ...p,
                      [openId!]: { ...editing, deadline: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenId(null)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
