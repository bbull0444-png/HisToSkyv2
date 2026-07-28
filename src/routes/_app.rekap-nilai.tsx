import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Pencil, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MEETINGS } from "@/features/meetings/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAMES = ["Aisyah", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita", "Hana"];

// Tanggal pelaksanaan tiap pertemuan (mingguan mulai 15 Juli 2025).
const MEETING_DATES: Record<number, Date> = Object.fromEntries(
  MEETINGS.map((m, i) => {
    const d = new Date(2025, 6, 15);
    d.setDate(d.getDate() + i * 7);
    return [m.id, d];
  }),
);

type SortKey = "name-asc" | "name-desc" | "avg-asc" | "avg-desc";

export const Route = createFileRoute("/_app/rekap-nilai")({
  component: RekapNilai,
});

function RekapNilai() {
  const [scores, setScores] = useState<Record<string, Record<number, number>>>(() => {
    const initial: Record<string, Record<number, number>> = {};
    NAMES.forEach((n, i) => {
      initial[n] = {};
      MEETINGS.forEach((m, j) => {
        initial[n][m.id] = 65 + ((i * 7 + j * 5) % 30);
      });
    });
    return initial;
  });

  const [search, setSearch] = useState("");
  const [meetingFilter, setMeetingFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const [editing, setEditing] = useState<{ name: string; meetingId: number } | null>(null);
  const [buffer, setBuffer] = useState<number>(0);

  const visibleMeetings = useMemo(() => {
    return MEETINGS.filter((m) => {
      if (meetingFilter !== "all" && String(m.id) !== meetingFilter) return false;
      const d = MEETING_DATES[m.id];
      if (from && d < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [meetingFilter, from, to]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredNames = NAMES.filter((n) => (q ? n.toLowerCase().includes(q) : true));
    const built = filteredNames.map((name) => {
      const vals = visibleMeetings.map((m) => scores[name][m.id]);
      const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { name, vals, avg };
    });
    built.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "avg-asc":
          return a.avg - b.avg;
        case "avg-desc":
          return b.avg - a.avg;
      }
    });
    return built;
  }, [scores, search, sort, visibleMeetings]);

  const classAvg = rows.length ? Math.round(rows.reduce((a, r) => a + r.avg, 0) / rows.length) : 0;

  const openEdit = (name: string, meetingId: number) => {
    setBuffer(scores[name][meetingId]);
    setEditing({ name, meetingId });
  };

  const save = () => {
    if (!editing) return;
    const clamped = Math.max(0, Math.min(100, Math.round(buffer)));
    setScores((prev) => ({
      ...prev,
      [editing.name]: { ...prev[editing.name], [editing.meetingId]: clamped },
    }));
    toast.success(`Nilai ${editing.name} P${editing.meetingId} disimpan`);
    setEditing(null);
  };

  const resetFilters = () => {
    setSearch("");
    setMeetingFilter("all");
    setSort("name-asc");
    setFrom(undefined);
    setTo(undefined);
  };

  const activeFilters =
    (search ? 1 : 0) +
    (meetingFilter !== "all" ? 1 : 0) +
    (from ? 1 : 0) +
    (to ? 1 : 0) +
    (sort !== "name-asc" ? 1 : 0);

  const exportCsv = () => {
    const header = ["Nama", ...visibleMeetings.map((m) => `P${m.id}`), "Rata-rata"];
    const body = rows.map((r) => [r.name, ...r.vals, r.avg]);
    const csv = [header, ...body].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekap-nilai.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rekap Nilai</h1>
          <p className="text-sm text-muted-foreground">
            Kelola nilai per siswa per pertemuan. Rata-rata kelas (terfilter):{" "}
            <span className="font-semibold text-foreground">{classAvg}</span>
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-1 h-4 w-4" /> Ekspor CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filter & Pengurutan</span>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-3.5 w-3.5" /> Reset ({activeFilters})
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            <Label>Cari siswa</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nama siswa…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pertemuan</Label>
            <Select value={meetingFilter} onValueChange={setMeetingFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua pertemuan</SelectItem>
                {MEETINGS.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    Pertemuan {m.id} — {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Urutkan</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Nama (A → Z)</SelectItem>
                <SelectItem value="name-desc">Nama (Z → A)</SelectItem>
                <SelectItem value="avg-desc">Rata-rata (tertinggi)</SelectItem>
                <SelectItem value="avg-asc">Rata-rata (terendah)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rentang tanggal pertemuan</Label>
            <div className="flex gap-2">
              <DatePick value={from} onChange={setFrom} placeholder="Dari" />
              <DatePick value={to} onChange={setTo} placeholder="Sampai" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <span>Rekap Nilai Kelas</span>
            <Badge variant="secondary">
              {rows.length} siswa · {visibleMeetings.length} pertemuan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {visibleMeetings.length === 0 || rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada data yang cocok dengan filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  {visibleMeetings.map((m) => (
                    <TableHead key={m.id} className="text-right">
                      <div>P{m.id}</div>
                      <div className="text-[10px] font-normal text-muted-foreground">
                        {format(MEETING_DATES[m.id], "dd MMM")}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Rata²</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    {r.vals.map((s, j) => (
                      <TableCell key={j} className="text-right">
                        <button
                          onClick={() => openEdit(r.name, visibleMeetings[j].id)}
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 hover:bg-accent"
                        >
                          {s}
                          <Pencil className="h-3 w-3 opacity-40" />
                        </button>
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{r.avg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Nilai</DialogTitle>
            <DialogDescription>
              {editing?.name} · Pertemuan {editing?.meetingId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="score">Nilai (0–100)</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={100}
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DatePick({
  value,
  onChange,
  placeholder,
}: {
  value?: Date;
  onChange: (d: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-1 h-4 w-4" />
          {value ? format(value, "dd MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
