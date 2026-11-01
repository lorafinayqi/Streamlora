import { useEffect, useState } from "react";

const API = "https://api.tenrai.org/v1";

function normalizeTitle(value = "") {
  return value.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

function getYouTubeId(trailer) {
  if (trailer?.youtube_id) return trailer.youtube_id;

  const url = trailer?.embed_url || trailer?.url || "";
  const match = url.match(
    /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );

  return match?.[1] || null;
}

export default function AnimeTrailer({ title }) {
  const [trailerId, setTrailerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!title) return;

    const controller = new AbortController();

    async function fetchTrailer() {
      setLoading(true);
      setError(false);
      setTrailerId(null);

      try {
        const searchResponse = await fetch(
          `${API}/anime?q=${encodeURIComponent(title)}`,
          { signal: controller.signal }
        );

        if (!searchResponse.ok) throw new Error("Gagal mencari anime");

        const searchResult = await searchResponse.json();
        const animeList = searchResult.data || [];

        const anime =
          animeList.find((item) =>
            [item.title, item.title_english, item.title_japanese].some(
              (name) =>
                name && normalizeTitle(name) === normalizeTitle(title)
            )
          ) || animeList[0];

        const animeId = anime?.mal_id || anime?.id;

        if (!animeId) return;

        const videoResponse = await fetch(
          `${API}/anime/${animeId}/videos`,
          { signal: controller.signal }
        );

        if (!videoResponse.ok) throw new Error("Gagal mengambil trailer");

        const videoResult = await videoResponse.json();
        const videos = videoResult.data?.promo || [];

        const foundTrailer = videos.find((video) =>
          getYouTubeId(video.trailer)
        );

        if (foundTrailer) {
          setTrailerId(getYouTubeId(foundTrailer.trailer));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Trailer API error:", err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchTrailer();

    return () => controller.abort();
  }, [title]);

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-black text-[#493545]">
        Trailer Anime
      </h2>

      <div className="mx-auto max-w-2xl">
        {loading ? (
          <p className="py-8 text-center text-pink-400">
            Sedang mencari trailer...
          </p>
        ) : trailerId ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-md shadow-pink-200/40">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${trailerId}`}
              title={`Trailer ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="py-8 text-center text-gray-400">
            {error
              ? "Trailer gagal dimuat. Coba lagi nanti."
              : "Trailer belum tersedia."}
          </p>
        )}
      </div>
    </section>
  );
}