import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Lock,
  Unlock,
  Presentation,
  Download,
  HelpCircle,
  Heart,
  Users,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { requireGuru } from "@/lib/route-guards";
import { supabase } from "@/lib/supabase";
import {
  fetchMeetings,
  updateMeetingPresentationLock,
  type MeetingSummary,
} from "@/features/meetings/meetingsApi";
import {
  fetchGroupProducts,
  fetchQuestionsForMeeting,
  setQuestionSelected,
  fetchAppreciationsForMeeting,
  setAppreciationSelected,
  deleteGroupProduct,
  deleteQuestionById,
  deleteAppreciationById,
  resetPresentationForMeeting,
  type GroupProductWithGroup,
  type PresentationQuestionWithRelations,
  type PresentationAppreciationWithRelations,
} from "@/features/presentasi/presentasi";

export const Route = createFileRoute("/_app/kelola-presentasi")({
  beforeLoad: requireGuru,
  loader: async () => {
    const meetings = await fetchMeetings();
    return { meetings };
  },
  component: KelolaPresentasiPage,
});

function ProductPreviewInline({
  product,
}: {
  product: { file_url: string; file_type: string; file_name: string };
}) {
  if (product.file_type === "pdf") {
    return (
      <iframe
        src={product.file_url}
        title={product.file_name}
        className="h-48 w-full rounded-md border"
      />
    );
  }
  if (product.file_type === "png" || product.file_type === "jpg") {
    return (
      <img
        src={product.file_url}
        alt={product.file_name}
        className="max-h-48 w-full rounded-md border object-contain"
      />
    );
  }
  return (
    <a
      href={product.file_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
    >
      <Presentation className="h-4 w-4 shrink-0 text-primary" />
      <span className="truncate">{product.file_name}</span>
      <Download className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function KelolaPresentasiPage() {
  const { meetings: initialMeetings } = Route.useLoaderData();
  const [meetings, setMeetings] = useState<MeetingSummary[]>(initialMeetings);
  const [meetingId, setMeetingId] = useState<string>(
    initialMeetings[0] ? String(initialMeetings[0].id) : "",
  );
  const [products, setProducts] = useState<GroupProductWithGroup[]>([]);
  const [questions, setQuestions] = useState<PresentationQuestionWithRelations[]>([]);
  const [appreciations, setAppreciations] = useState<PresentationAppreciationWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingLock, setTogglingLock] = useState(false);
  const [resetting, setResetting] = useState(false);

  const selectedMeeting = meetings.find((m) => String(m.id) === meetingId) ?? null;

  const load = async (id: number) => {
    setLoading(true);
    const [p, q, a] = await Promise.all([
      fetchGroupProducts(id),
      fetchQuestionsForMeeting(id),
      fetchAppreciationsForMeeting(id),
    ]);
    setProducts(p);
    setQuestions(q);
    setAppreciations(a);
    setLoading(false);
  };

  useEffect(() => {
    if (!meetingId) return;
    load(Number(meetingId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;
    const id = Number(meetingId);

    // Live-update: sama pola dengan kelola-tanggapan.tsx -- guru tidak perlu
    // reload manual saat siswa mengunggah produk / kirim pertanyaan-apresiasi.
    const channel = supabase
      .channel(`presentasi-live-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_products", filter: `meeting_id=eq.${id}` },
        () => load(id),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presentation_questions", filter: `meeting_id=eq.${id}` },
        () => load(id),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "presentation_appreciations",
          filter: `meeting_id=eq.${id}`,
        },
        () => load(id),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  const toggleLock = async () => {
    if (!selectedMeeting) return;
    setTogglingLock(true);
    const next = !selectedMeeting.presentationLocked;
    try {
      await updateMeetingPresentationLock(selectedMeeting.id, next);
      setMeetings((prev) =>
        prev.map((m) => (m.id === selectedMeeting.id ? { ...m, presentationLocked: next } : m)),
      );
      toast.success(next ? "Sesi presentasi dikunci" : "Sesi presentasi dibuka kembali");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah status sesi presentasi");
    } finally {
      setTogglingLock(false);
    }
  };

  const toggleQuestion = async (q: PresentationQuestionWithRelations) => {
    if (!meetingId) return;
    try {
      // Memilih satu pertanyaan otomatis melepas pertanyaan lain di
      // pertemuan yang sama (lihat setQuestionSelected) -- reload penuh
      // supaya state lokal tetap konsisten dengan efek itu.
      await setQuestionSelected(Number(meetingId), q.id, !q.is_selected);
      await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui status pertanyaan");
    }
  };

  const toggleAppreciation = async (a: PresentationAppreciationWithRelations) => {
    if (!meetingId) return;
    try {
      // Memilih satu apresiasi otomatis melepas apresiasi lain di
      // pertemuan yang sama (lihat setAppreciationSelected) -- reload penuh
      // supaya state lokal tetap konsisten dengan efek itu.
      await setAppreciationSelected(Number(meetingId), a.id, !a.is_selected);
      await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui status apresiasi");
    }
  };

  const handleDeleteProduct = async (product: GroupProductWithGroup) => {
    try {
      await deleteGroupProduct(product);
      toast.success(`Produk kelompok "${product.group_name}" dihapus`);
      if (meetingId) await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus produk kelompok");
    }
  };

  const handleDeleteQuestion = async (q: PresentationQuestionWithRelations) => {
    try {
      await deleteQuestionById(q.id);
      toast.success("Pertanyaan dihapus");
      if (meetingId) await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus pertanyaan");
    }
  };

  const handleDeleteAppreciation = async (a: PresentationAppreciationWithRelations) => {
    try {
      await deleteAppreciationById(a.id);
      toast.success("Apresiasi dihapus");
      if (meetingId) await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus apresiasi");
    }
  };

  const handleReset = async () => {
    if (!meetingId) return;
    setResetting(true);
    try {
      await resetPresentationForMeeting(Number(meetingId));
      toast.success("Seluruh data presentasi pertemuan ini direset");
      await load(Number(meetingId));
    } catch (err) {
      console.error(err);
      toast.error("Gagal mereset data presentasi");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Moderasi Presentasi</h1>
          <p className="text-sm text-muted-foreground">
            Tinjau produk kelompok, pilih pertanyaan yang ditampilkan, dan kelola sesi presentasi.
          </p>
        </div>

        <Select value={meetingId} onValueChange={setMeetingId}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Pilih pertemuan" />
          </SelectTrigger>
          <SelectContent>
            {meetings.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                Pertemuan {m.order} — {m.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedMeeting && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm">
            {selectedMeeting.presentationLocked ? (
              <>
                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Sesi presentasi <strong>terkunci</strong> — siswa tidak bisa lagi mengirim/mengubah
                  pertanyaan &amp; apresiasi.
                </span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  Sesi presentasi <strong>terbuka</strong> — siswa masih bisa mengirim/mengubah
                  pertanyaan &amp; apresiasi.
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={selectedMeeting.presentationLocked ? "outline" : "default"}
              onClick={toggleLock}
              disabled={togglingLock}
            >
              {togglingLock
                ? "Menyimpan..."
                : selectedMeeting.presentationLocked
                  ? "Buka Kunci"
                  : "Mulai Sesi (Kunci)"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={resetting} className="gap-1.5 text-destructive hover:text-destructive">
                  <RotateCcw className="h-3.5 w-3.5" />
                  {resetting ? "Mereset..." : "Reset Presentasi"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset seluruh data presentasi pertemuan ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Semua produk kelompok (beserta filenya di penyimpanan), seluruh pertanyaan, dan
                    seluruh apresiasi untuk pertemuan ini akan dihapus permanen. Tindakan ini tidak
                    bisa dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleReset}
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {!selectedMeeting ? (
        <p className="text-sm text-muted-foreground">Belum ada pertemuan.</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Produk Kelompok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada produk yang diunggah.</p>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{p.group_name}</div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus produk "{p.group_name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              File akan dihapus dari penyimpanan dan kelompok perlu mengunggah ulang
                              produknya.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteProduct(p)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <ProductPreviewInline product={p} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-4 w-4" />
                Pertanyaan ({questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada pertanyaan masuk.</p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <Checkbox
                      checked={q.is_selected}
                      onCheckedChange={() => toggleQuestion(q)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-medium">{q.student_name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline">untuk {q.target_group_name}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus pertanyaan dari {q.student_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Pertanyaan ini akan dihapus permanen dari daftar.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteQuestion(q)}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{q.question}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4" />
                Apresiasi ({appreciations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appreciations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada apresiasi masuk.</p>
              ) : (
                appreciations.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <Checkbox
                      checked={a.is_selected}
                      onCheckedChange={() => toggleAppreciation(a)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="font-medium">{a.student_name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline">untuk {a.target_group_name}</Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus apresiasi dari {a.student_name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apresiasi ini akan dihapus permanen dari daftar.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteAppreciation(a)}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{a.message}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
