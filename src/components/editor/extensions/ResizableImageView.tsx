import { useCallback, useRef, useState, type CSSProperties } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

type Align = "left" | "center" | "right";
type HandlePos = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const MIN_WIDTH_PX = 60;

// xDir/yDir: arah drag yang memperbesar gambar untuk masing-masing handle.
// 0 berarti handle itu tidak menggerakkan sumbu tsb (mis. handle N tidak
// mempengaruhi sumbu X secara langsung, hanya Y).
const HANDLE_CONFIG: Record<HandlePos, { x: -1 | 0 | 1; y: -1 | 0 | 1; cursor: string }> = {
  n: { x: 0, y: -1, cursor: "ns-resize" },
  s: { x: 0, y: 1, cursor: "ns-resize" },
  e: { x: 1, y: 0, cursor: "ew-resize" },
  w: { x: -1, y: 0, cursor: "ew-resize" },
  nw: { x: -1, y: -1, cursor: "nwse-resize" },
  ne: { x: 1, y: -1, cursor: "nesw-resize" },
  sw: { x: -1, y: 1, cursor: "nesw-resize" },
  se: { x: 1, y: 1, cursor: "nwse-resize" },
};

const HANDLES = Object.keys(HANDLE_CONFIG) as HandlePos[];

function wrapperStyle(align: Align): CSSProperties {
  switch (align) {
    case "left":
      return { float: "left", margin: "4px 16px 12px 0" };
    case "right":
      return { float: "right", margin: "4px 0 12px 16px" };
    case "center":
    default:
      return { display: "block", float: "none", margin: "12px auto" };
  }
}

export function ResizableImageView({
  node,
  updateAttributes,
  selected,
  editor,
}: NodeViewProps) {
  const { src, alt, title } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
  };
  const width = (node.attrs.width as string) || "50%";
  const align = (node.attrs.align as Align) || "center";

  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = useState<string | null>(null);

  // Menyimpan state drag yang sedang berjalan. Karena kita pakai Pointer
  // Capture langsung pada handle, tidak perlu window.addEventListener sama
  // sekali — semua event pointermove/pointerup mengalir ke handle yang sama.
  const dragState = useRef<{
    startX: number;
    startY: number;
    startWidthPx: number;
    containerWidth: number;
    aspectRatio: number; // width / height, dari naturalWidth/naturalHeight
    xDir: -1 | 0 | 1;
    yDir: -1 | 0 | 1;
  } | null>(null);

  const editable = editor.isEditable;

  const getContainerWidth = useCallback(() => {
    const proseMirrorEl = editor.view.dom as HTMLElement;
    const styles = getComputedStyle(proseMirrorEl);
    const paddingX =
      parseFloat(styles.paddingLeft || "0") 
      parseFloat(styles.paddingRight || "0");
    return Math.max(1, proseMirrorEl.clientWidth - paddingX);
  }, [editor]);

  const computeNewWidthPx = useCallback((dx: number, dy: number) => {
    const state = dragState.current;
    if (!state) return null;
    const { startWidthPx, xDir, yDir, aspectRatio } = state;

    let deltaPx = 0;
    if (xDir !== 0 && yDir !== 0) {
      // Handle sudut: gabungkan dx & dy (dy dikonversi ke skala lebar
      // lewat aspect ratio) supaya drag diagonal terasa natural, mirip Word.
      const dxContribution = dx * xDir;
      const dyContribution = dy * yDir * aspectRatio;
      deltaPx = (dxContribution + dyContribution) / 2;
    } else if (xDir !== 0) {
      deltaPx = dx * xDir;
    } else {
      // Handle N/S: gerakan vertikal dikonversi ke perubahan lebar lewat
      // aspect ratio, karena height selalu "auto" mengikuti width.
      deltaPx = dy * yDir * aspectRatio;
    }

    return startWidthPx + deltaPx;
  }, []);

  const handlePointerDown = useCallback(
    (pos: HandlePos) => (event: React.PointerEvent<HTMLSpanElement>) => {
      if (!editable || !imgRef.current) return;
      event.preventDefault();
      event.stopPropagation();

      const img = imgRef.current;
      const { x: xDir, y: yDir } = HANDLE_CONFIG[pos];
      const startWidthPx = img.getBoundingClientRect().width;
      const naturalW = img.naturalWidth || startWidthPx;
      const naturalH = img.naturalHeight || 1;
      const aspectRatio = naturalW / naturalH || 1;
      const containerWidth = getContainerWidth();

      dragState.current = {
        startX: event.clientX,
        startY: event.clientY,
        startWidthPx,
        containerWidth,
        aspectRatio,
        xDir,
        yDir,
      };

      // Pointer Capture pada handle itu sendiri: seluruh event pointermove/
      // pointerup berikutnya otomatis diarahkan ke elemen ini, walau kursor
      // keluar dari handle. Lifecycle lebih aman daripada window listener
      // (otomatis dilepas browser saat pointer/capture berakhir).
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    },
    [editable, getContainerWidth],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      const state = dragState.current;
      if (!state || !imgRef.current) return;

      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const rawWidthPx = computeNewWidthPx(dx, dy);
      if (rawWidthPx == null) return;

      const clampedPx = Math.max(
        MIN_WIDTH_PX,
        Math.min(rawWidthPx, state.containerWidth),
      );
      const pct = Math.max(5, Math.min(100, (clampedPx / state.containerWidth) * 100));
      const widthStr = `${pct.toFixed(1)}%`;

      // Update WRAPPER langsung, real-time, tanpa transaksi ProseMirror.
      // img (width:100%) dan outline (inset:0) ikut otomatis karena
      // keduanya dihitung relatif terhadap box wrapper ini.
      if (wrapperRef.current) {
        wrapperRef.current.style.width = widthStr;
     }
      setLiveWidth(widthStr);
    },
    [computeNewWidthPx],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (!dragState.current) return;

      const finalWidth = wrapperRef.current?.style.width || width;
      dragState.current = null;
      setLiveWidth(null);

      if ((event.target as HTMLElement).hasPointerCapture?.(event.pointerId)) {
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      }

      // Commit sekali ke document model → tepat 1 langkah undo/redo per
      // aksi resize, walau drag terjadi lewat puluhan pointermove.
      updateAttributes({ width: finalWidth });
    },
    [updateAttributes, width],
  );

  const handlePointerCancel = useCallback(() => {
    // Drag dibatalkan (mis. window kehilangan fokus) → jangan commit apa pun,
    // biarkan width kembali ke nilai tersimpan terakhir.
    dragState.current = null;
    setLiveWidth(null);
  }, []);

  const displayWidth = liveWidth ?? width;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      as="div"
      className="resizable-image-wrapper"
      data-align={align}
      style={{ ...wrapperStyle(align), width: displayWidth, position: "relative" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt || ""}
        title={title}
        draggable={false}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: "0.375rem",
        }}
      />

      {selected && editable && (
        <>
          <div className="resizable-image-outline" />
          {HANDLES.map((pos) => (
            <span
              key={pos}
              className={`resize-handle resize-handle-${pos}`}
              style={{ cursor: HANDLE_CONFIG[pos].cursor }}
              onPointerDown={handlePointerDown(pos)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          ))}
        </>
      )}
    </NodeViewWrapper>
  );
}

export default ResizableImageView;