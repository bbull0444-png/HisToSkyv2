import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface PlaceholderOptions {
  /** Teks placeholder yang muncul saat editor kosong */
  placeholder: string;
}

/**
 * Extension placeholder ringan, mandiri (tidak bergantung pada
 * paket terpisah @tiptap/extension-placeholder).
 *
 * Menambahkan class `is-editor-empty` + atribut `data-placeholder`
 * pada blok teks pertama yang kosong, lalu di-style lewat editor.css:
 *
 *   .is-editor-empty::before { content: attr(data-placeholder); ... }
 */
export const Placeholder = Extension.create<PlaceholderOptions>({
  name: "placeholder",

  addOptions() {
    return {
      placeholder: "Tulis sesuatu...",
    };
  },

  addProseMirrorPlugins() {
    const { placeholder } = this.options;

    return [
      new Plugin({
        key: new PluginKey("placeholder"),
        props: {
          decorations: ({ doc }) => {
            const isEditorEmpty =
              doc.childCount === 1 &&
              doc.firstChild?.isTextblock &&
              doc.firstChild.content.size === 0;

            if (!isEditorEmpty) {
              return null;
            }

            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.isTextblock && node.content.size === 0) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "is-editor-empty",
                    "data-placeholder": placeholder,
                  }),
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

export default Placeholder;