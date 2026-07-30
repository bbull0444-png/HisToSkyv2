import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

interface MateriHeaderProps {
  pertemuan: number;
  judul: string;
  status: "draft" | "published";
  onSave?: () => void;
}

export function MateriHeader({
  pertemuan,
  judul,
  status,
  onSave,
}: MateriHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="px-0">
            <Link to="/kelola-materi">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Kelola Materi
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Materi Pertemuan {pertemuan}
            </h1>

            <p className="mt-1 text-muted-foreground">
              {judul}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className="capitalize px-3 py-1"
          >
            {status}
          </Badge>

          <Button onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}