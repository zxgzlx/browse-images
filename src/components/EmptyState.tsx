type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "subtle" | "default";
};

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: Props) => {
  const isSubtle = variant === "subtle";

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border px-6 py-6 text-center ${
        isSubtle
          ? "border-white/5 bg-white/5 text-slate-200"
          : "border-dashed border-white/15 bg-white/5 text-slate-100"
      }`}
    >
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
      {actionLabel && onAction && (
        <button
          className="mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:translate-y-[-1px]"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
