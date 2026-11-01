import { Link } from "react-router-dom";

function MangaCard({ manga }) {
  const slug = manga.slug || manga.id;

  return (
    <Link
      to={`/manga/${encodeURIComponent(String(slug))}`}
      className="group block min-w-0"
    >
      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-pink-100">
        {manga.cover ? (
          <img
            src={manga.cover}
            alt={manga.title || "Anime"}
            loading="lazy"
            className="aspect-[3/4] w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center bg-pink-50 p-3 text-center text-sm text-pink-400">
            Cover belum tersedia
          </div>
        )}
      </div>

      <h3 className="mt-3 truncate font-semibold text-[#493545] transition group-hover:text-pink-500">
        {manga.title || "Anime tanpa judul"}
      </h3>

      <p className="mt-1 text-sm font-medium text-pink-500">
        {manga.chapter || manga.episode || ""}
      </p>

      <p className="mt-1 truncate text-xs text-[#9B8292]">
        {manga.genre || "Genre belum tersedia"}
      </p>
    </Link>
  );
}

export default MangaCard;