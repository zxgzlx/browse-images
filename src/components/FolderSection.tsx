import { convertFileSrc } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { useMemo, useCallback } from "react";
import { FolderGroup } from "../types/gallery";
import { ImageTile } from "./ImageTile";

type Props = {
  folder: FolderGroup;
  expanded: boolean;
  onToggle: (path: string) => void;
};

export const FolderSection = ({ folder, expanded, onToggle }: Props) => {
  const images = useMemo(
    () =>
      folder.images.map((imagePath) => ({
        id: imagePath,
        url: convertFileSrc(imagePath),
        name: imagePath.split(/[/\\]/).pop() ?? imagePath,
        path: imagePath,
      })),
    [folder.images]
  );

  const openFolder = useCallback(async () => {
    try {
      await revealItemInDir(folder.path);
    } catch (err) {
      console.error("Failed to open folder", err);
    }
  }, [folder.path]);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/40">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-50">{folder.name}</p>
          <p className="truncate text-xs text-slate-400">
            {folder.images.length} 张 · {folder.path}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/15"
            onClick={openFolder}
            type="button"
          >
            打开目录
          </button>
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/15"
            onClick={() => onToggle(folder.path)}
            type="button"
          >
            {expanded ? "折叠" : "展开"}
          </button>
        </div>
      </header>

      {expanded && (
        <div className="mt-4">
          {images.length === 0 ? (
            <p className="text-sm text-slate-400">该文件夹没有图片</p>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
              {images.map((img) => (
                <ImageTile
                  key={img.id}
                  src={img.url}
                  title={img.name}
                  filePath={img.path}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
