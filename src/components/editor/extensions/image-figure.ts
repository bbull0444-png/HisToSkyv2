import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeSelection,
  TextSelection,
  Plugin,
  PluginKey,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFigure: {
      /** Bungkus image yang sedang selected ke dalam figure + caption kosong. */
      wrapImageInFigure: () => ReturnType;
    };
  }
}

export const FigCaption = Node.create({
  name: "figcaption",
  content: "inline*",
  selectable: false,

  parseHTML() {
    return [{ tag: "figcaption" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figcaption", mergeAttributes(HTMLAttributes), 0];
  },

  // Placeholder visual "Keterangan gambar..." saat figcaption kosong.
  // Murni Decoration (tidak menambah node/attribute baru ke schema).
  addProseMirrorPlugins() {
    const pluginKey = new PluginKey("figcaptionPlaceholder");

    return [
      new Plugin({
        key: pluginKey,
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (node.type.name === "figcaption" && node.content.size === 0) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "is-empty",
                    "data-placeholder": "Keterangan gambar (mis. Gambar 1. ...)",
                  }),
                );
              }
              return true;
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

// Figure: parent node berisi `image` (NodeView resize/selection existing di
// ResizableImageView.tsx, TIDAK diubah dan TIDAK ada NodeView figure
// terpisah) + `figcaption`. Bersifat opt-in — dokumen lama yang hanya berisi
// `<img>` polos tetap valid sebagai node `image` standalone.
export const ImageFigure = Node.create({
  name: "figure",
  group: "block",
  content: "image figcaption",
  draggable: true,
  isolating: true,

  parseHTML() {
    return [
      {
        tag: "figure",
        // Hanya cocokkan <figure> yang memang berisi img + figcaption,
        // supaya <figure> dari sumber lain tidak salah ter-parse.
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const hasImg = element.querySelector("img");
          const hasCaption = element.querySelector("figcaption");
          return hasImg && hasCaption ? null : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { class: "tiptap-image-figure" }),
      0,
    ];
  },

  addCommands() {
    return {
      wrapImageInFigure:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          if (
            !(selection instanceof NodeSelection) ||
            selection.node.type.name !== "image"
          ) {
            return false;
          }

          const $from = state.doc.resolve(selection.from);
          if ($from.parent.type.name === "figure") {
            return false; // sudah punya caption
          }

          const figureType = state.schema.nodes.figure;
          const figcaptionType = state.schema.nodes.figcaption;
          if (!figureType || !figcaptionType) return false;

          const imageNode = selection.node;
          const figure = figureType.create(null, [
            imageNode,
            figcaptionType.create(),
          ]);

          if (dispatch) {
  const tr = state.tr.replaceWith(selection.from, selection.to, figure);

  // Pindahkan cursor ke dalam figcaption
  const figurePos = selection.from;
  const figcaptionStart = figurePos + 1 + imageNode.nodeSize;
  const $caption = tr.doc.resolve(figcaptionStart + 1);

  tr.setSelection(TextSelection.near($caption, 1));

  dispatch(tr);
}
          return true;
        },
    };
  },
});

export default ImageFigure;