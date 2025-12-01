type Props = {
  folderPath: string | null;
  onChooseFolder: () => void;
  onRefresh: () => void;
};

export const HeaderBar = ({ folderPath, onChooseFolder, onRefresh }: Props) => {
  const canRefresh = Boolean(folderPath);

  return (
    <header className="sticky top-3 z-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg shadow-black/30">
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-gradient-to-br from-cyan-300 to-emerald-400 shadow-[0_0_20px] shadow-emerald-500/50" />
          <div>
            <p className="text-lg font-semibold leading-tight">Browse Images</p>
            <p className="text-xs text-slate-400">本地文件夹 · 瀑布流展示</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2 text-sm text-slate-100 md:min-w-0">
          {folderPath ? (
            <>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                当前目录
              </span>
              <span className="truncate text-slate-100">{folderPath}</span>
            </>
          ) : (
            <span className="text-slate-500">尚未选择文件夹</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onRefresh}
            disabled={!canRefresh}
            type="button"
          >
            刷新
          </button>
          <button
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:translate-y-[-1px]"
            onClick={onChooseFolder}
            type="button"
          >
            选择/更换文件夹
          </button>
        </div>
      </div>
    </header>
  );
};
