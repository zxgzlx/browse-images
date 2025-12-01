import { useCallback, useEffect, useMemo, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import "./App.css";

type FolderGroup = {
  name: string;
  path: string;
  images: string[];
};

const LAST_FOLDER_KEY = "browse-images:last-folder";

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderGroup[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const resetExpansion = useCallback((groups: FolderGroup[]) => {
    const next: Record<string, boolean> = {};
    groups.forEach((group) => {
      next[group.path] = true;
    });
    setExpanded(next);
  }, []);

  const fetchImages = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await invoke<FolderGroup[]>("load_images_from_dir", {
          root: path,
        });
        setFolders(result);
        setFolderPath(path);
        resetExpansion(result);
        localStorage.setItem(LAST_FOLDER_KEY, path);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "加载图片失败";
        setError(msg);
        setFolders([]);
        setFolderPath(null);
        localStorage.removeItem(LAST_FOLDER_KEY);
      } finally {
        setLoading(false);
        setHasAttemptedLoad(true);
      }
    },
    [resetExpansion]
  );

  const chooseFolder = useCallback(async () => {
    try {
      const selected = await invoke<string | null>("pick_folder");
      if (selected) {
        fetchImages(selected);
      }
    } catch {
      setError("无法打开文件选择器");
    }
  }, [fetchImages]);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_FOLDER_KEY);
    if (saved) {
      fetchImages(saved);
    } else {
      setHasAttemptedLoad(true);
    }
  }, [fetchImages]);

  const hasImages = useMemo(
    () => folders.some((group) => group.images.length > 0),
    [folders]
  );

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="dot" />
          <div className="brand-text">
            <div className="title">Browse Images</div>
            <div className="subtitle">本地文件夹 · 瀑布流展示</div>
          </div>
        </div>
        <div className="path">
          {folderPath ? (
            <>
              <span className="label">当前目录</span>
              <span className="path-text">{folderPath}</span>
            </>
          ) : (
            <span className="label muted">尚未选择文件夹</span>
          )}
        </div>
        <div className="actions">
          <button className="ghost" onClick={chooseFolder}>
            选择/更换文件夹
          </button>
        </div>
      </header>

      <main className="content">
        {!folderPath && hasAttemptedLoad && (
          <div className="empty-state">
            <div className="empty-title">选择一个文件夹开始浏览</div>
            <div className="empty-desc">
              自动记住最近打开的路径，下次启动直接展示。
            </div>
            <button className="primary" onClick={chooseFolder}>
              打开文件夹
            </button>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {folderPath && !hasImages && !loading && (
          <div className="empty-state subtle">
            <div className="empty-title">这个目录里没有可用图片</div>
            <div className="empty-desc">支持 jpg/png/gif/webp/bmp/tiff/svg。</div>
          </div>
        )}

        {folders.map((folder) => (
          <section className="folder-section" key={folder.path}>
            <div className="folder-header" onClick={() => toggleFolder(folder.path)}>
              <div>
                <div className="folder-name">{folder.name}</div>
                <div className="folder-meta">
                  {folder.images.length} 张 · {folder.path}
                </div>
              </div>
              <button className="toggle">
                {expanded[folder.path] === false ? "展开" : "折叠"}
              </button>
            </div>
            {expanded[folder.path] !== false && (
              <>
                {folder.images.length === 0 ? (
                  <div className="folder-empty">该文件夹没有图片</div>
                ) : (
                  <div className="masonry">
                    {folder.images.map((image) => (
                      <figure className="image-tile" key={image}>
                        <img src={convertFileSrc(image)} alt={image} loading="lazy" />
                        <figcaption>{image.split(/[/\\\\]/).pop()}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        ))}

        {loading && <div className="loading">正在加载图片...</div>}
      </main>
    </div>
  );
}

export default App;
