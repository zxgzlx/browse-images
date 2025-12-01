type Props = {
  src: string;
  title: string;
};

export const ImageTile = ({ src, title }: Props) => {
  return (
    <figure className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/40 transition hover:border-white/20 hover:bg-white/10">
      <img
        src={src}
        alt={title}
        loading="lazy"
        className="w-full rounded-xl object-cover"
      />
      <figcaption className="mt-2 truncate text-xs text-slate-200">{title}</figcaption>
    </figure>
  );
};
