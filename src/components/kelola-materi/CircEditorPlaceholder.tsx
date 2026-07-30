import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

export interface CircEditorPlaceholderProps {
  /** Judul sintaks CIRC, mis. "1. Reading" */
  title: string;
  /** Deskripsi singkat, opsional */
  description?: string;
  /** Konten HTML saat ini (controlled) */
  value: string;
  /** Dipanggil setiap konten berubah, mengirim HTML terbaru */
  onChange: (value: string) => void;
  /** Nonaktifkan editing (mode read-only) */
  editable?: boolean;
  /** Teks placeholder saat editor kosong */
  placeholder?: string;
  className?: string;
  /** Dipanggil saat tombol "Simpan" di toolbar diklik */
  onSave?: () => void;
  /** Status loading tombol save */
  isSaving?: boolean;
}

export function CircEditorPlaceholder({
  title,
  description,
  value,
  onChange,
  editable = true,
  placeholder,
  className,
  onSave,
  isSaving,
}: CircEditorPlaceholderProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <RichTextEditor
          value={value}
          onChange={onChange}
          editable={editable}
          placeholder={placeholder}
          onSave={onSave}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
}

export default CircEditorPlaceholder;