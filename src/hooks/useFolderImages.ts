import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FolderGroup } from "../types/gallery";

const LAST_FOLDER_KEY = "browse-images:last-folder";

const normalizeError = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "加载图片失败";
};

export const useFolderImages = () => {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const fetchImages = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<FolderGroup[]>("load_images_from_dir", {
        root: path,
      });
      setFolders(result);
      setFolderPath(path);
      localStorage.setItem(LAST_FOLDER_KEY, path);
    } catch (err) {
      setError(normalizeError(err));
      setFolders([]);
      setFolderPath(null);
      localStorage.removeItem(LAST_FOLDER_KEY);
    } finally {
      setLoading(false);
      setHasAttemptedLoad(true);
    }
  }, []);

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

  return {
    folderPath,
    folders,
    loading,
    error,
    hasAttemptedLoad,
    hasImages,
    chooseFolder,
    refresh: () => {
      if (folderPath) {
        fetchImages(folderPath);
      }
    },
  };
};
