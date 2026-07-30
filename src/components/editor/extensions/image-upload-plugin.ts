import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";

import { uploadMateriImage, UploadImageError } from "@/lib/upload-materi-image";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const imageUploadPluginKey = new PluginKey<DecorationSet>(
  "imageUploadPasteDrop",
);

function genUploadId(): string {
  return `up_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Placeholder murni DOM (thumbnail + spinner) — UI sementara, bukan node
// document. Manipulasi DOM di sini diizinkan karena scope-nya cuma preview
// upload, bukan konten final.
function createPlaceholderDOM(file: File): { dom: HTMLElement; blobUrl: string } {
  const blobUrl = URL.createObjectURL(file);

  const wrapper = document.createElement("span");
  wrapper.className = "upload-placeholder";
  wrapper.contentEditable = "false";

  const thumb = document.createElement("span");
  thumb.className = "upload-placeholder-thumb";

  const img = document.createElement("img");
  img.src = blobUrl;
  img.alt = file.name;

  const spinner = document.createElement("span");
  spinner.className = "upload-placeholder-spinner";
  spinner.setAttribute("aria-label", "Mengunggah...");

  thumb.appendChild(img);
  thumb.appendChild(spinner);
  wrapper.appendChild(thumb);

  return { dom: wrapper, blobUrl };
}

// DecorationSet adalah single source of truth untuk posisi placeholder.
// Tidak ada Map<id, pos> terpisah — posisi SELALU dibaca ulang dari
// decoration yang tersimpan, yang otomatis ter-`map()` mengikuti setiap
// transaction (termasuk edit di tempat lain selagi upload berjalan).
function findDecorationById(set: DecorationSet, id: string): Decoration | undefined {
  const found = set.find(undefined, undefined, (spec) => spec.id === id);
  return found[0];
}

function insertPlaceholderDecoration(
  editor: Editor,
  pos: number,
  side: number,
  file: File,
): { uploadId: string; blobUrl: string } {
  const uploadId = genUploadId();
  const { dom, blobUrl } = createPlaceholderDOM(file);

  const { tr } = editor.state;
  tr.setMeta(imageUploadPluginKey, {
    add: { id: uploadId, pos, side, dom },
  });
  editor.view.dispatch(tr);

  return { uploadId, blobUrl };
}

function removePlaceholderDecoration(editor: Editor, uploadId: string) {
  const { tr } = editor.state;
  tr.setMeta(imageUploadPluginKey, { remove: { id: uploadId } });
  editor.view.dispatch(tr);
}

async function runUpload(
  editor: Editor,
  uploadId: string,
  file: File,
  blobUrl: string,
) {
  try {
    const url = await uploadMateriImage(file);

    const currentSet = imageUploadPluginKey.getState(editor.state);
    const deco = currentSet ? findDecorationById(currentSet, uploadId) : undefined;

    // Placeholder sudah dihapus user sebelum upload selesai → buang hasil.
    if (!deco) {
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // `deco.from` adalah posisi widget saat ini, sudah otomatis ter-mapping
    // mengikuti seluruh transaction yang terjadi sejak decoration dibuat.
    const pos = deco.from;

    const imageNode = editor.schema.nodes.image.create({
      src: url,
      alt: file.name,
      width: "50%",
      align: "center",
    });

    const { tr } = editor.state;
    tr.insert(pos, imageNode);
    tr.setMeta(imageUploadPluginKey, { remove: { id: uploadId } });
    // SENGAJA masuk history normal (default) → tepat 1 langkah undo/redo
    // untuk keseluruhan aksi paste/drop gambar.
    editor.view.dispatch(tr);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    URL.revokeObjectURL(blobUrl);

    const currentSet = imageUploadPluginKey.getState(editor.state);
    const deco = currentSet ? findDecorationById(currentSet, uploadId) : undefined;
    if (deco) {
      removePlaceholderDecoration(editor, uploadId);
    }

    const message =
      error instanceof UploadImageError
        ? error.message
        : "Gagal mengunggah gambar. Silakan paste atau drop ulang.";
    toast.error(message);
  }
}

function filesFromFileList(list: FileList): File[] {
  const files: File[] = [];
  for (let i = 0; i < list.length; i++) {
    const file = list.item(i);
    if (file && ACCEPTED_TYPES.includes(file.type)) files.push(file);
  }
  return files;
}

function filesFromDataTransferItems(items: DataTransferItemList): File[] {
  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file && ACCEPTED_TYPES.includes(file.type)) files.push(file);
    }
  }
  return files;
}

export function createImageUploadPlugin(getEditor: () => Editor) {
  return new Plugin<DecorationSet>({
    key: imageUploadPluginKey,

    state: {
      init: () => DecorationSet.empty,
      apply(tr, decorationSet) {
        decorationSet = decorationSet.map(tr.mapping, tr.doc);

        const meta = tr.getMeta(imageUploadPluginKey) as
          | { add?: { id: string; pos: number; side: number; dom: HTMLElement } }
          | { remove?: { id: string } }
          | undefined;

        if (meta && "add" in meta && meta.add) {
          const { id, pos, side, dom } = meta.add;
          const deco = Decoration.widget(pos, dom, { id, side });
          decorationSet = decorationSet.add(tr.doc, [deco]);
        }

        if (meta && "remove" in meta && meta.remove) {
          const { id } = meta.remove;
          const toRemove = findDecorationById(decorationSet, id);
          if (toRemove) decorationSet = decorationSet.remove([toRemove]);
        }

        return decorationSet;
      },
    },

    props: {
      decorations(state) {
        return imageUploadPluginKey.getState(state) ?? null;
      },

      handlePaste(view, event) {
        const editor = getEditor();
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const fileListImages = filesFromFileList(clipboardData.files);
        const images =
          fileListImages.length > 0
            ? fileListImages
            : filesFromDataTransferItems(clipboardData.items);

        if (images.length === 0) {
          return false; // bukan image → biarkan paste teks/HTML default berjalan
        }

        event.preventDefault();

        // Semua file yang dipaste bersamaan disisipkan pada posisi cursor
        // YANG SAMA (widget decoration tidak mengubah ukuran document).
        // Urutan tampil antar widget di posisi yang sama diatur lewat
        // `side` (ascending mengikuti urutan file), bukan lewat pos.
        const pos = view.state.selection.from;
        images.forEach((file, index) => {
          const { uploadId, blobUrl } = insertPlaceholderDecoration(
            editor,
            pos,
            index,
            file,
          );
          void runUpload(editor, uploadId, file, blobUrl);
        });
        return true;
      },

      handleDrop(view, event) {
        const editor = getEditor();
        const dt = event.dataTransfer;
        if (!dt || dt.files.length === 0) {
          return false; // bukan drop file dari OS → biarkan drag internal default
        }

        const allFiles = Array.from(dt.files);
        const imageFiles = allFiles.filter((f) => ACCEPTED_TYPES.includes(f.type));

        if (imageFiles.length === 0) {
          event.preventDefault();
          toast.error(
            "File yang di-drop bukan gambar. Gunakan format PNG, JPG, WEBP, atau GIF.",
          );
          return true;
        }

        event.preventDefault();
        const dropPos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        const pos = dropPos ? dropPos.pos : view.state.selection.from;

        imageFiles.forEach((file, index) => {
          const { uploadId, blobUrl } = insertPlaceholderDecoration(
            editor,
            pos,
            index,
            file,
          );
          void runUpload(editor, uploadId, file, blobUrl);
        });
        return true;
      },

      handleDOMEvents: {
        dragover(view, event) {
          if (event.dataTransfer?.types?.includes("Files")) {
            view.dom.classList.add("is-drag-over");
          }
          return false;
        },
        dragleave(view) {
          view.dom.classList.remove("is-drag-over");
          return false;
        },
        drop(view) {
          view.dom.classList.remove("is-drag-over");
          return false;
        },
      },
    },
  });
}