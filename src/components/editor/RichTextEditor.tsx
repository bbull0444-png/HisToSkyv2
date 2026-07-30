import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Highlight } from "@tiptap/extension-highlight";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Toolbar } from "./Toolbar";
import { Placeholder } from "./extensions/placeholder";
import { ResizableImage } from "./extensions/resizable-image";
import { ImageFigure, FigCaption } from "./extensions/image-figure";
import { cn } from "@/lib/utils";

import "./editor.css";

export interface RichTextEditorProps {
  /** Konten HTML saat ini (controlled) */
  value: string;
  /** Dipanggil setiap konten berubah, mengirim HTML terbaru */
  onChange: (html: string) => void;
  /** Nonaktifkan editing (mode read-only) */
  editable?: boolean;
  /** Teks placeholder saat editor kosong */
  placeholder?: string;
  className?: string;
  /** Dipanggil saat tombol "Simpan" di toolbar diklik. Kalau tidak diisi, tombol save tidak ditampilkan. */
  onSave?: () => void;
  /** Tampilkan status loading di tombol save */
  isSaving?: boolean;
}

/**
 * Rich text editor berbasis Tiptap yang reusable.
 * Dipakai untuk konten materi (CIRC), LKPD, dsb.
 */
export function RichTextEditor({
  value,
  onChange,
  editable = true,
  placeholder = "Mulai menulis di sini...",
  className,
  onSave,
  isSaving,
}: RichTextEditorProps) {
  const editor = useEditor({
    editable,
    // wajib untuk SSR (TanStack Start) supaya tidak ada hydration mismatch
    immediatelyRender: false,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        underline: false,
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["paragraph", "heading"],
        defaultAlignment: "left",
      }),
      Highlight.configure({ multicolor: false }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
      ImageFigure,
      FigCaption,
      Youtube.configure({ nocookie: true, controls: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // sinkronkan editor saat `value` berubah dari luar
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml === value) return;

    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  // sinkronkan mode editable jika prop berubah setelah editor dibuat
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[260px] animate-pulse rounded-md border border-input bg-muted/30",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background",
        !editable && "bg-muted/40",
        className,
      )}
    >
      {editable && (
        <Toolbar editor={editor} onSave={onSave} isSaving={isSaving} />
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "tiptap-editor-content px-4 py-3",
          !editable && "cursor-default select-text",
        )}
      />
    </div>
  );
}

export default RichTextEditor;