import { useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo2,
  Redo2,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Save,
  Palette,
  Captions,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { uploadMateriImage, UploadImageError } from "@/lib/upload-materi-image";

interface ToolbarProps {
  editor: Editor;
  onSave?: () => void;
  isSaving?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={!!isActive}
      title={label}
      className={cn(
        "h-8 w-8 text-muted-foreground hover:text-foreground",
        isActive && "bg-accent text-foreground",
      )}
    >
      {children}
    </Button>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="mx-1 h-6" />;
}

const IMAGE_SIZES = [
  { label: "25%", value: "25%" },
  { label: "50%", value: "50%" },
  { label: "75%", value: "75%" },
  { label: "100%", value: "100%" },
];

const IMAGE_ALIGNS = [
  { label: "Kiri (teks di kanan)", value: "left", icon: AlignLeft },
  { label: "Tengah", value: "center", icon: AlignCenter },
  { label: "Kanan (teks di kiri)", value: "right", icon: AlignRight },
] as const;

const FONT_COLORS = [
  { label: "Default", value: "" },
  { label: "Merah", value: "#dc2626" },
  { label: "Oranye", value: "#ea580c" },
  { label: "Kuning", value: "#ca8a04" },
  { label: "Hijau", value: "#16a34a" },
  { label: "Biru", value: "#2563eb" },
  { label: "Ungu", value: "#9333ea" },
];

function ImageSizeControls({ editor }: { editor: Editor }) {
  if (!editor.isActive("image")) return null;

  const attrs = editor.getAttributes("image");
  const currentWidth = attrs.width ?? "50%";
  const currentAlign = attrs.align ?? "center";

  const setWidth = (width: string) => {
    editor.chain().focus().updateAttributes("image", { width }).run();
  };

  const setAlign = (align: string) => {
    editor.chain().focus().updateAttributes("image", { align }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-input bg-muted/20 px-2 py-1.5">
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Ukuran:</span>
        {IMAGE_SIZES.map((s) => (
          <Button
            key={s.value}
            type="button"
            size="sm"
            variant={currentWidth === s.value ? "secondary" : "ghost"}
            className="h-6 px-2 text-xs"
            onClick={() => setWidth(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <ToolbarSeparator />

      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Posisi:</span>
        {IMAGE_ALIGNS.map((a) => {
          const Icon = a.icon;
          return (
            <ToolbarButton
              key={a.value}
              label={a.label}
              isActive={currentAlign === a.value}
              onClick={() => setAlign(a.value)}
            >
              <Icon className="h-4 w-4" />
            </ToolbarButton>
          );
        })}
      </div>
    </div>
  );
}

function FontColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const currentColor = editor.getAttributes("textStyle").color ?? "";

  const setColor = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <ToolbarButton
        label="Warna Teks"
        isActive={open || !!currentColor}
        onClick={() => setOpen((v) => !v)}
      >
        <Palette
          className="h-4 w-4"
          style={currentColor ? { color: currentColor } : undefined}
        />
      </ToolbarButton>

      {open && (
        <>
          {/* backdrop buat nutup popover pas klik luar */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 flex flex-wrap gap-1 rounded-md border border-input bg-background p-2 shadow-md w-40">
            {FONT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onClick={() => setColor(c.value)}
                className={cn(
                  "h-6 w-6 rounded-full border border-input",
                  currentColor === c.value && "ring-2 ring-offset-1 ring-ring",
                )}
                style={{ backgroundColor: c.value || "transparent" }}
              >
                {!c.value && (
                  <span className="block h-full w-full rounded-full bg-gradient-to-br from-transparent via-transparent to-transparent bg-[linear-gradient(to_bottom_right,transparent_calc(50%-1px),red,transparent_calc(50%+1px))]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Toolbar({ editor, onSave, isSaving }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadMateriImage(file);
      editor
        .chain()
        .focus()
        .setImage({
          src: url,
          alt: file.name,
          width: "50%",
          align: "center",
        } as any)
        .run();
      toast.success("Gambar berhasil diunggah.");
    } catch (error) {
      const message =
        error instanceof UploadImageError
          ? error.message
          : "Gagal mengunggah gambar. Coba lagi.";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleYoutubePlaceholder = () => {
    toast.info(
      "Sisipkan video YouTube belum tersedia. Fitur ini akan segera hadir.",
    );
  };

  const handleAddCaption = () => {
    const applied = editor.chain().focus().wrapImageInFigure().run();
    console.log("wrapImageInFigure applied:", applied, editor.getHTML());
    if (!applied) {
      toast.info("Pilih gambar terlebih dahulu untuk menambahkan keterangan.");
    }
  };


  return (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border-b border-input bg-muted/30 p-2">
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Bold"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Highlight"
          isActive={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
        <FontColorPicker editor={editor} />

        <ToolbarSeparator />

        <ToolbarButton
          label="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Rata Kiri"
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={editor.isActive("heading")}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Rata Tengah"
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Rata Kanan"
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Rata Kiri-Kanan"
          isActive={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Bullet List"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Ordered List"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton label="Sisipkan Tabel" onClick={handleInsertTable}>
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Sisipkan Gambar"
          onClick={handleImageButtonClick}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleImageFileSelected}
        />

        <ToolbarButton
          label="Tambah Keterangan Gambar"
          onClick={handleAddCaption}
          disabled={!editor.isActive("image")}
        >
          <Captions className="h-4 w-4" />
       </ToolbarButton>

        <ToolbarButton
          label="Sisipkan YouTube (segera hadir)"
          onClick={handleYoutubePlaceholder}
        >
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>

        {onSave && (
          <>
            <div className="ml-auto" />
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-8 gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        )}
      </div>

      <ImageSizeControls editor={editor} />
    </>
  );
}

export default Toolbar;
