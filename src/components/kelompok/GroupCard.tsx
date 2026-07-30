import DeleteMemberDialog from "./DeleteMemberDialog";
import StudentPicker from "./StudentPicker";
import { useState } from "react";
import { Crown, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LeaderDialog from "./LeaderDialog";

interface Student {
  id: number;
  full_name: string;
}

interface GroupCardProps {
  id: number;
  groupName: string;
  leaderId: number | null;
  members: Student[];

  onRemove: (studentId: number) => void;

  // dipanggil setelah ketua berhasil disimpan
  onLeaderSaved: () => void;
}

export default function GroupCard({
  id,
  groupName,
  leaderId,
  members,
  onRemove,
  onLeaderSaved,
}: GroupCardProps) {
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

const [selectedStudent, setSelectedStudent] =
  useState<Student | null>(null);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{groupName}</CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeaderOpen(true)}
          >
            <Crown className="mr-2 h-4 w-4" />
            Ketua
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {members.length} Anggota
          </div>

          <div className="space-y-2">
            {members.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div className="flex items-center gap-2">
                  {leaderId === student.id && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}

                  <span>{student.full_name}</span>
                </div>

                <Button
  variant="ghost"
  size="icon"
  onClick={() => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  }}
>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            variant="secondary"
            onClick={() => setPickerOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Anggota
          </Button>
        </CardContent>
      </Card>

      <LeaderDialog
        open={leaderOpen}
        onOpenChange={setLeaderOpen}
        groupId={id}
        leaderId={leaderId}
        members={members}
        onSaved={onLeaderSaved}
      />

      <StudentPicker
  open={pickerOpen}
  onOpenChange={setPickerOpen}
  groupId={id}
  onAdded={onLeaderSaved}
/>

<DeleteMemberDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  studentName={selectedStudent?.full_name ?? ""}
  onConfirm={() => {
    if (!selectedStudent) return;

    onRemove(selectedStudent.id);

    setDeleteOpen(false);
    setSelectedStudent(null);
  }}
/>
    </>
  );
}