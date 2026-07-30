import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";

import { ResizableImageView } from "./ResizableImageView";
import { createImageUploadPlugin } from "./image-upload-plugin";

// Tidak override `name` — extend Image apa adanya. Schema, renderHTML, dan
// parseHTML identik dengan HTML lama & upload Supabase yang sudah ada
// sebelumnya. Tidak ada migrasi database yang dibutuhkan.
function buildStyle(width: string, align: string) {
  const base = `width: ${width}; height: auto;`;

  switch (align) {
    case "left":
      return `${base} float: left; margin: 4px 16px 12px 0;`;
    case "right":
      return `${base} float: right; margin: 4px 0 12px 16px;`;
    case "center":
    default:
      return `${base} display: block; float: none; margin: 12px auto;`;
  }
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "50%",
        renderHTML: (attributes) => ({ width: attributes.width }),
        parseHTML: (element) =>
          element.style.width || element.getAttribute("width") || "50%",
      },
      align: {
        default: "center",
        renderHTML: (attributes) => ({ align: attributes.align }),
        parseHTML: (element) => {
          if (element.style.float === "left") return "left";
          if (element.style.float === "right") return "right";
          return "center";
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, align, ...rest } = HTMLAttributes;
    return [
      "img",
      {
        ...rest,
        style: buildStyle(width || "50%", align || "center"),
      },
    ];
  },

  // NodeView resize/selection — TIDAK PERNAH diubah sejak final resize
  // disetujui. ProseMirror otomatis memakai NodeView ini di mana pun node
  // `image` berada, termasuk sebagai child dari node `figure` (caption),
  // sehingga resize/selection/toolbar tetap bekerja tanpa kode tambahan.
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  // Delete gambar via transaction ProseMirror langsung (bukan manipulasi
  // DOM). Kalau image berada di dalam `figure` (punya caption), hapus
  // seluruh figure+caption dalam SATU transaction supaya tidak pernah
  // menyisakan figure kosong, dan undo/redo tetap satu langkah.
  addKeyboardShortcuts() {
    const deleteSelectedImageOrFigure = () =>
      this.editor.commands.command(({ state, tr, dispatch }) => {
        const { selection } = state;
        if (
          !(selection instanceof NodeSelection) ||
          selection.node.type.name !== this.name
        ) {
          return false; // bukan image yang selected → biarkan default behavior lain
        }

        const $from = state.doc.resolve(selection.from);

        if ($from.parent.type.name === "figure") {
          // Hapus figure (image + figcaption) sekaligus, satu transaction.
          const figureDepth = $from.depth;
          const figureStart = $from.before(figureDepth);
          const figureNode = $from.node(figureDepth);

          if (dispatch) {
            tr.delete(figureStart, figureStart + figureNode.nodeSize);
          }
          return true;
        }

        // Image berdiri sendiri (tanpa figure) → hapus image saja.
        if (dispatch) {
          tr.delete(selection.from, selection.to);
        }
        return true;
      });

    return {
      Backspace: deleteSelectedImageOrFigure,
      Delete: deleteSelectedImageOrFigure,
    };
  },

  // Plugin ProseMirror untuk paste (Ctrl+V) & drag-drop image dari OS.
  // Placeholder selama upload berlangsung memakai Decoration.widget murni
  // (lihat image-upload-plugin.ts) — bukan Node, tidak masuk schema/document.
  addProseMirrorPlugins() {
    return [createImageUploadPlugin(() => this.editor)];
  },
});

export default ResizableImage;