import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
  useRef,
  type WheelEvent,
} from "react";

type Props = {
  image: { src: string; title: string; filePath: string };
  onClose: () => void;
};

const ZOOM_STEPS = [1, 1.5, 2, 2.5, 3];

export const ImagePreviewModal = ({ image, onClose }: Props) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });

  const name = useMemo(
    () => image.title || image.filePath.split(/[/\\]/).pop() || image.filePath,
    [image.filePath, image.title]
  );

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, [image]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const rotatePoint = useCallback(
    (point: { x: number; y: number }) => {
      if (rotation === 0) return point;
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos,
      };
    },
    [rotation]
  );

  const getNextZoom = useCallback(
    (current: number, direction: number, wrap = false) => {
      const index = ZOOM_STEPS.findIndex((step) => step === current);
      if (index === -1) return ZOOM_STEPS[0];
      const nextIndex = wrap
        ? (index + direction + ZOOM_STEPS.length) % ZOOM_STEPS.length
        : Math.min(Math.max(index + direction, 0), ZOOM_STEPS.length - 1);
      return ZOOM_STEPS[nextIndex];
    },
    []
  );

  const applyZoomAtPoint = useCallback(
    (nextZoom: number, point: { x: number; y: number }) => {
      setOffset((prev) => {
        if (nextZoom === zoom) return prev;
        const rotated = rotatePoint(point);
        const delta = zoom - nextZoom;
        return {
          x: prev.x + delta * rotated.x,
          y: prev.y + delta * rotated.y,
        };
      });
      setZoom(nextZoom);
    },
    [rotatePoint, zoom]
  );

  const handleAuxClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.button === 1) {
        event.preventDefault();
        event.stopPropagation();
        const rect = imageRef.current?.getBoundingClientRect();
        const point = rect
          ? {
              x: event.clientX - (rect.left + rect.width / 2),
              y: event.clientY - (rect.top + rect.height / 2),
            }
          : { x: 0, y: 0 };
        const nextZoom = getNextZoom(zoom, 1, true);
        applyZoomAtPoint(nextZoom, point);
      }
    },
    [applyZoomAtPoint, getNextZoom, zoom]
  );

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.deltaY < 0 ? 1 : -1;
      const rect = imageRef.current?.getBoundingClientRect();
      const point = rect
        ? {
            x: event.clientX - (rect.left + rect.width / 2),
            y: event.clientY - (rect.top + rect.height / 2),
          }
        : { x: 0, y: 0 };
      const nextZoom = getNextZoom(zoom, direction);
      applyZoomAtPoint(nextZoom, point);
    },
    [applyZoomAtPoint, getNextZoom, zoom]
  );

  const handleRotate = useCallback(
    () => setRotation((current) => (current + 90) % 360),
    []
  );

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleBackdropClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      setIsPanning(true);
      panStart.current = { x: event.clientX, y: event.clientY };
      panOffsetStart.current = { x: offset.x, y: offset.y };
    },
    [offset.x, offset.y]
  );

  useEffect(() => {
    if (!isPanning) return;
    const handleMove = (event: MouseEvent) => {
      const dx = event.clientX - panStart.current.x;
      const dy = event.clientY - panStart.current.y;
      setOffset({
        x: panOffsetStart.current.x + dx,
        y: panOffsetStart.current.y + dy,
      });
    };
    const handleUp = () => setIsPanning(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isPanning]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm px-3 py-6"
      onClick={handleBackdropClick}
      onWheel={handleWheel}
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-3">
        <header className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100 shadow-lg shadow-black/50 backdrop-blur">
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-xs text-slate-300">
              中键/滚轮缩放 · 拖拽平移 · 当前 {zoom}x · 旋转 {rotation}°
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/15"
            >
              重置
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/15"
            >
              顺时针 90°
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-400"
            >
              关闭
            </button>
          </div>
        </header>

        <div
          className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/60"
          onAuxClick={handleAuxClick}
          onMouseDown={handleMouseDown}
          style={{
            cursor: isPanning ? "grabbing" : zoom > 1 ? "grab" : "default",
          }}
        >
          <div className="flex h-full items-center justify-center p-4">
            <img
              src={image.src}
              alt={name}
              draggable={false}
              className="max-h-full max-w-full select-none transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
              ref={imageRef}
            />
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 px-4 py-2 text-[11px] text-slate-100 shadow-lg shadow-black/40">
            <span>中键/滚轮：缩放</span>
            <span className="h-3 w-px bg-white/30" />
            <span>当前倍率 {zoom}x</span>
            <span className="h-3 w-px bg-white/30" />
            <span>旋转 {rotation}°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
