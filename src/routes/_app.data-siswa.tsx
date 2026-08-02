import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Save, X, Trash2, Plus } from "lucide-react";
import { requireGuru } from "@/lib/route-guards";
import { Badge } from "@/components/ui/badge";
import { isOnline, formatLastActive } from "@/features/presence/presence";

interface Student {
  id: number;
  full_name: string;
  gender: string;
  username: string;
  password: string;
  last_active_at: string | null;
}

type StudentForm = Omit<Student, "id">;

const emptyForm: StudentForm = {
  full_name: "",
  gender: "L",
  username: "",
  password: "",
};

export const Route = createFileRoute("/_app/data-siswa")({
  beforeLoad: requireGuru,
  component: () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<StudentForm>(emptyForm);
    const [saving, setSaving] = useState(false);

    const [adding, setAdding] = useState(false);
    const [newForm, setNewForm] = useState<StudentForm>(emptyForm);

    async function loadStudents() {
      setLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) {
        console.error(error);
        setError("Gagal memuat data siswa");
        setLoading(false);
        return;
      }

      setStudents(data as Student[]);
      setError(null);
      setLoading(false);
    }

    useEffect(() => {
      loadStudents();
      // Refresh diam-diam tiap 30 detik biar kolom status tetap update
      // tanpa guru perlu reload manual. Gak nyalain `loading` biar gak
      // ada kedip spinner tiap refresh.
      const id = setInterval(async () => {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("full_name", { ascending: true });
        if (!error && data) setStudents(data as Student[]);
      }, 30_000);
      return () => clearInterval(id);
    }, []);

    function startEdit(s: Student) {
      setEditingId(s.id);
      setEditForm({
        full_name: s.full_name,
        gender: s.gender,
        username: s.username,
        password: s.password,
      });
    }

    function cancelEdit() {
      setEditingId(null);
      setEditForm(emptyForm);
    }

    async function saveEdit(id: number) {
      setSaving(true);
      const { error } = await supabase
        .from("students")
        .update({
          full_name: editForm.full_name,
          gender: editForm.gender,
          username: editForm.username,
          password: editForm.password,
        })
        .eq("id", id);

      setSaving(false);

      if (error) {
        console.error(error);
        alert("Gagal menyimpan perubahan");
        return;
      }

      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...editForm } : s)),
      );
      setEditingId(null);
    }

    async function deleteStudent(id: number) {
      if (!confirm("Hapus siswa ini? Tindakan tidak bisa dibatalkan.")) return;

      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) {
        console.error(error);
        alert("Gagal menghapus siswa");
        return;
      }

      setStudents((prev) => prev.filter((s) => s.id !== id));
    }

    async function addStudent() {
      if (!newForm.full_name.trim() || !newForm.username.trim()) {
        alert("Nama dan username wajib diisi");
        return;
      }

      setSaving(true);
      const { data, error } = await supabase
        .from("students")
        .insert({
  full_name: newForm.full_name,
  gender: newForm.gender,
  username: newForm.username,
  password: newForm.password,
  class_name: "XI 12",
  active: true,
})
        .select()
        .single();

      setSaving(false);

      if (error) {
        console.error(error);
        alert("Gagal menambahkan siswa");
        return;
      }

      setStudents((prev) => [...prev, data as Student]);
      setAdding(false);
      setNewForm(emptyForm);
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Data Siswa</h1>
            <p className="text-sm text-muted-foreground">
              Daftar siswa dan akun login mereka. Klik ikon pensil untuk edit.
            </p>
          </div>
          <Button
            onClick={() => {
              setAdding(true);
              setNewForm(emptyForm);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah Siswa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kelas XI 12 ({students.length} siswa)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adding && (
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        baru
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newForm.full_name}
                          onChange={(e) =>
                            setNewForm({ ...newForm, full_name: e.target.value })
                          }
                          placeholder="Nama lengkap"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={newForm.gender}
                          onValueChange={(v) =>
                            setNewForm({ ...newForm, gender: v })
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="P">P</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newForm.username}
                          onChange={(e) =>
                            setNewForm({ ...newForm, username: e.target.value })
                          }
                          placeholder="username"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={newForm.password}
                          onChange={(e) =>
                            setNewForm({ ...newForm, password: e.target.value })
                          }
                          placeholder="password"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          onClick={addStudent}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdding(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                  {students.map((s, i) => {
                    const isEditing = editingId === s.id;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  full_name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.full_name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editForm.gender}
                              onValueChange={(v) =>
                                setEditForm({ ...editForm, gender: v })
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="P">P</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            s.gender
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editForm.username}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  username: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.username
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editForm.password}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  password: e.target.value,
                                })
                              }
                            />
                          ) : (
                            "••••••"
                          )}
                        </TableCell>
                        <TableCell>
                          {isOnline(s.last_active_at) ? (
                            <Badge className="gap-1.5 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Aktif sekarang
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {formatLastActive(s.last_active_at)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(s.id)}
                                disabled={saving}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteStudent(s.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
});