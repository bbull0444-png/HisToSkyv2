import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { requireGuru } from "@/lib/route-guards";
import {
  fetchMeetings,
  createMeeting,
  updateMeetingStatus,
  deleteMeeting,
  type MeetingSummary,
} from "@/features/meetings/meetingsApi";

// PENTING: path diakhiri "/" -> ini yang membuatnya jadi INDEX route
// (sibling dari $id, bukan parent-nya)
export const Route = createFileRoute("/_app/kelola-materi/")({
  beforeLoad: requireGuru,
  loader: async () => {
    const meetings = await fetchMeetings();
    return { meetings };
  },
  component: KelolaMateri,
});

function KelolaMateri() {
  const { meetings: initialMeetings } = Route.useLoaderData();
  const [meetings, setMeetings] = useState<MeetingSummary[]>(initialMeetings);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [adding, setAdding] = useState(false);

  const toggle = async (id: number) => {
    const target = meetings.find((m) => m.id === id);
    if (!target) return;
    const next = target.status === "published" ? "draft" : "published";
    setSavingId(id);
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
    try {
      await updateMeetingStatus(id, next);
    } catch {
      setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status: target.status } : m)));
      toast.error("Gagal menyimpan status");
    } finally {
      setSavingId(null);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const created = await createMeeting(newTitle.trim(), newSubtitle.trim());
      if (created) {
        setMeetings((prev) => [...prev, created]);
        toast.success("Pertemuan baru ditambahkan");
        setNewTitle("");
        setNewSubtitle("");
        setAddOpen(false);
      } else {
        toast.error("Gagal menambah pertemuan");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMeeting(id);
      const refreshed = await fetchMeetings();
      setMeetings(refreshed);
      toast.success("Pertemuan dihapus");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kelola Materi</h1>
          <p className="text-sm text-muted-foreground">
            Atur ketersediaan pertemuan pembelajaran CIRC. Pertemuan berstatus "Draft" tidak akan
            muncul/bisa diakses siswa.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Pertemuan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pertemuan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-title">Judul</Label>
                <Input
                  id="new-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: KEMERDEKAAN & PEMBENTUKAN NEGARA"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-subtitle">Subjudul</Label>
                <Input
                  id="new-subtitle"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Contoh: Proklamasi dan Konsolidasi Bangsa"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Pertemuan baru dibuat sebagai Draft dan ditaruh di urutan paling akhir. Isi materi
                tiap tahap CIRC diisi lewat tombol "Edit" setelah dibuat.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={adding || !newTitle.trim()}>
                {adding ? "Menambahkan..." : "Tambah"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {meetings.map((m) => {
          const status = m.status;
          return (
            <Card key={m.id}>
              <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pertemuan {m.order}
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
                    disabled={savingId === m.id}
                  >
                    {savingId === m.id
                      ? "Menyimpan..."
                      : status === "published"
                        ? "Jadikan Draft"
                        : "Publish"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === m.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus "{m.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ini akan menghapus pertemuan ini beserta seluruh isi materi, progres
                          belajar siswa, dan refleksi yang terkait. Tindakan ini tidak bisa
                          dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(m.id)}
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {meetings.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Belum ada pertemuan. Klik "Tambah Pertemuan" untuk membuat yang pertama.
        </p>
      )}
    </div>
  );
}