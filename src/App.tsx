import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "./components/EmptyState";
import { FolderSection } from "./components/FolderSection";
import { HeaderBar } from "./components/HeaderBar";
import { ImagePreviewModal } from "./components/ImagePreviewModal";
import { useFolderImages } from "./hooks/useFolderImages";

const toAnchorId = (path: string) =>
  ("folder-" + path.replace(/[^a-zA-Z0-9]/g, "-"))
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "folder";

function App() {
  const {
    folderPath,
    folders,
    loading,
    error,
    hasAttemptedLoad,
    hasImages,
    chooseFolder,
    refresh,
  } = useFolderImages();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [preview, setPreview] = useState<{
    src: string;
    title: string;
    filePath: string;
  } | null>(null);

  const folderNav = useMemo(
    () =>
      folders.map((folder) => ({
        name: folder.name,
        anchorId: toAnchorId(folder.path),
      })),
    [folders]
  );

  useEffect(() => {
    const next: Record<string, boolean> = {};
    folders.forEach((group) => {
      next[group.path] = true;
    });
    setExpanded(next);
  }, [folders]);

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <HeaderBar
          folderPath={folderPath}
          folderNav={folderNav}
          onChooseFolder={chooseFolder}
          onRefresh={() => refresh()}
        />

        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
            {error}
          </div>
        )}

        <main className="space-y-4">
          {!folderPath && hasAttemptedLoad && (
            <EmptyState
              title="选择一个文件夹开始浏览"
              description="自动记住最近打开的路径，下次启动直接展示。"
              actionLabel="打开文件夹"
              onAction={chooseFolder}
            />
          )}

          {folderPath && !hasImages && !loading && (
            <EmptyState
              variant="subtle"
              title="这个目录里没有可用图片"
              description="支持 jpg/png/gif/webp/bmp/tiff/svg。"
              actionLabel="更换文件夹"
              onAction={chooseFolder}
            />
          )}

          {folders.map((folder) => (
            <FolderSection
              key={folder.path}
              folder={folder}
              expanded={expanded[folder.path] !== false}
              onToggle={toggleFolder}
              anchorId={toAnchorId(folder.path)}
              onPreview={setPreview}
            />
          ))}

          {loading && (
            <div className="fixed bottom-4 right-4 rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-lg shadow-black/40">
              正在加载图片...
            </div>
          )}
        </main>
      </div>

      {preview && (
        <ImagePreviewModal image={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

export default App;
