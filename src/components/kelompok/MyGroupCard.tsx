import { useEffect, useState } from "react";
import { Crown, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStoredUser } from "@/features/auth/AuthContext";
import { supabase } from "@/lib/supabase";

interface MyGroup {
  id: number;
  group_name: string;
  leader_student_id: number | null;
  members: { id: number; full_name: string }[];
}

type GroupMeta = {
  id: number;
  group_name: string;
  leader_student_id: number | null;
};

type StudentMeta = {
  id: number;
  full_name: string;
};

interface GroupMemberRow {
  group_id: number;
  groups: GroupMeta | null;
  students: StudentMeta | null;
}

function asSingle<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function storageKey(userId: number) {
  return `sky-learn:my-group:${userId}`;
}

function loadFromStorage(userId: number): MyGroup | null {
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MyGroup;
    if (parsed && Array.isArray(parsed.members)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveToStorage(userId: number, group: MyGroup) {
  try {
    sessionStorage.setItem(storageKey(userId), JSON.stringify(group));
  } catch {
    // sessionStorage penuh atau tidak tersedia; abaikan.
  }
}

type FetchGroupResult =
  | { status: "assigned"; group: MyGroup }
  | { status: "not-assigned" }
  | { status: "error" };

async function fetchLiveGroup(studentId: number): Promise<FetchGroupResult> {
  try {
    const { data: memberships, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("student_id", studentId)
      .limit(1);

    if (membershipError) throw membershipError;

    const groupId = memberships?.[0]?.group_id;
    if (!groupId) return { status: "not-assigned" };

    const { data: rows, error } = await supabase
      .from("group_members")
      .select(
        `
        group_id,
        groups (
          id,
          group_name,
          leader_student_id
        ),
        students (
          id,
          full_name
        )
      `,
      )
      .eq("group_id", groupId)
      .order("student_id");

    if (error) throw error;

    const groupRows = (rows ?? []) as unknown as GroupMemberRow[];
    const meta = asSingle(groupRows[0]?.groups);
    if (!meta) return { status: "not-assigned" };

    const group: MyGroup = {
      id: meta.id,
      group_name: meta.group_name,
      leader_student_id: meta.leader_student_id,
      members: groupRows.map((row) => {
        const student = asSingle(row.students);
        return {
          id: student?.id ?? -1,
          full_name: student?.full_name ?? "-",
        };
      }),
    };

    return { status: "assigned", group };
  } catch (err) {
    console.error(err);
    return { status: "error" };
  }
}

function isEqualGroup(a: MyGroup | null, b: MyGroup | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.id !== b.id) return false;
  if (a.group_name !== b.group_name) return false;
  if (a.leader_student_id !== b.leader_student_id) return false;
  if (a.members.length !== b.members.length) return false;
  return a.members.every(
    (m, i) => m.id === b.members[i].id && m.full_name === b.members[i].full_name,
  );
}

export default function MyGroupCard() {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [group, setGroup] = useState<MyGroup | null>(null);
  const [notAssigned, setNotAssigned] = useState(false);

  const refresh = async (silent: boolean) => {
    const user = getStoredUser();
    if (!user) return;
    const studentId = Number(user.id);

    if (!silent) setLoading(true);
    setLoadError(false);

    const result = await fetchLiveGroup(studentId);

    if (result.status === "error") {
      setLoading(false);
      // Kalau silent (revalidasi background, cache sudah tampil), biarkan
      // data lama tetap tampil -- satu kegagalan fetch tidak boleh
      // mengganti tampilan yang sudah benar dengan pesan error.
      if (!silent) {
        setLoadError(true);
        toast.error("Gagal memuat data kelompok. Coba lagi.");
      }
      return;
    }

    if (result.status === "not-assigned") {
      sessionStorage.removeItem(storageKey(studentId));
      setNotAssigned(true);
      setGroup(null);
      setLoading(false);
      return;
    }

    setNotAssigned(false);
    setGroup((prev) => {
      if (isEqualGroup(prev, result.group)) return prev;
      saveToStorage(studentId, result.group);
      return result.group;
    });
    setLoading(false);
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;

    const cached = loadFromStorage(Number(user.id));
    if (cached) setGroup(cached);

    refresh(Boolean(cached));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !group && !notAssigned) {
    return (
      <Button disabled className="gap-1.5">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat kelompok...
      </Button>
    );
  }

  if (loadError && !group && !notAssigned) {
    return (
      <Button onClick={() => refresh(false)} className="gap-1.5">
        <Users className="h-4 w-4" />
        Coba Lagi
      </Button>
    );
  }

  if (!group && !notAssigned) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kelompok Belajar Anda
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {notAssigned ? (
          <p className="text-sm text-muted-foreground">
            Kamu belum tergabung dalam kelompok mana pun. Hubungi guru untuk
            pengelompokan.
          </p>
        ) : (
          group && (
            <>
              <div>
                <div className="text-sm text-muted-foreground">
                  Nama Kelompok
                </div>
                <div className="text-lg font-semibold">{group.group_name}</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Anggota Kelompok</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Peran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.members.map((member, i) => (
                      <TableRow key={member.id}>
                        <TableCell className="text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>{member.full_name}</TableCell>
                        <TableCell>
                          {member.id === group.leader_student_id ? (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3 text-yellow-500" />
                              Ketua
                            </Badge>
                          ) : (
                            <Badge variant="outline">Anggota</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-muted-foreground">
                Total anggota: {group.members.length} orang
              </div>
            </>
          )
        )}
      </CardContent>
    </Card>
  );
}
