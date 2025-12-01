import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

type Props = {
  src: string;
  title: string;
  filePath: string;
  onPreview: (payload: { src: string; title: string; filePath: string }) => void;
};

const DEFAULT_BG = "#0f172a";
const MAX_TILE_HEIGHT = 480;

export const ImageTile = ({ src, title, filePath, onPreview }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG);

  const imageName = useMemo(
    () => title || filePath.split(/[/\\]/).pop() || filePath,
    [filePath, title]
  );

  const openInExplorer = useCallback(async () => {
    try {
      await revealItemInDir(filePath);
    } catch (err) {
      console.error("Failed to open file location", err);
    }
  }, [filePath]);

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLImageElement>) => {
      event.preventDefault();
      openInExplorer();
    },
    [openInExplorer]
  );

  const handleClick = useCallback(() => {
    onPreview({ src, title: imageName, filePath });
  }, [filePath, imageName, onPreview, src]);

  const resetBackground = useCallback(() => setBackgroundColor(DEFAULT_BG), []);

  return (
    <figure
      className="mb-4 break-inside-avoid rounded-2xl border border-white/10 p-3 shadow-lg shadow-black/40 transition hover:border-white/20"
      style={{ backgroundColor }}
    >
      <div className="overflow-hidden rounded-xl border border-white/10">
        <img
          src={src}
          alt={imageName}
          loading="lazy"
          className="w-full max-h-[480px] object-contain transition duration-300 hover:scale-[1.01]"
          style={{ maxHeight: MAX_TILE_HEIGHT }}
          draggable={false}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        />
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
        <figcaption className="truncate flex-1">{imageName}</figcaption>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/15"
          onClick={openInExplorer}
        >
          打开目录
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-300">
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap">背景颜色</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-6 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0"
            aria-label={`${imageName} 背景颜色`}
          />
        </label>
        <button
          type="button"
          onClick={resetBackground}
          className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-white/20"
        >
          重置
        </button>
      </div>
    </figure>
  );
};
