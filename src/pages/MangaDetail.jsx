import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import AnimeTrailer from "../components/AnimeTrailer";
import AnimeCharacters from "../components/AnimeCharacters";
import {
  getRecentAnime,
  getAnimeDetail,
} from "../services/anikoto";

function MangaDetail() {
  const { slug } = useParams();

  const [manga, setManga] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [language, setLanguage] = useState("sub");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError("");

        const recentResult = await getRecentAnime();
        const recentList = Array.isArray(recentResult)
          ? recentResult
          : recentResult.data || [];

        const selectedAnime = recentList.find(
          (item) =>
            item.slug === slug ||
            String(item.id) === slug
        );

        if (!selectedAnime) {
          throw new Error("Anime tidak ditemukan.");
        }

        const detailResult = await getAnimeDetail(selectedAnime.id);

        if (!detailResult.ok) {
          throw new Error("Gagal mengambil detail anime.");
        }

        const anime = detailResult.anime || selectedAnime;

        const episodeList =
          detailResult.episodes ||
          detailResult.data?.episodes ||
          [];

        if (active) {
          setManga({
            ...selectedAnime,
            ...anime,
            title: anime.title || selectedAnime.title,
            cover:
              anime.poster ||
              anime.cover ||
              selectedAnime.poster ||
              selectedAnime.cover,
            synopsis:
              anime.description ||
              selectedAnime.description ||
              "Sinopsis belum tersedia.",
            genre: (
              anime.terms_by_type?.genre ||
              selectedAnime.terms_by_type?.genre ||
              []
            ).join(", "),
          });

          setEpisodes(episodeList);
          setSelectedEpisode(episodeList[0] || null);
        }
      } catch (err) {
        console.error("Anikoto API:", err);

        if (active) {
          setError(err.message || "Gagal memuat anime.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [slug]);

  const videoUrl = selectedEpisode?.embed_url?.[language];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF5FA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
          <p className="font-bold text-pink-500">
            Memuat anime...
          </p>
        </div>
      </main>
    );
  }

  if (error || !manga) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFF5FA] p-6 text-center">
        <h1 className="text-3xl font-black text-[#583B50]">
          Anime tidak ditemukan
        </h1>
        <p className="mt-3 text-[#A17F94]">{error}</p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-pink-500 px-6 py-3 font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-600"
        >
          ← Kembali ke Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF5FA] px-4 py-6 text-[#583B50] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* NAVIGASI */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-5 py-2.5 text-sm font-bold text-pink-500 shadow-sm transition hover:-translate-x-1 hover:bg-pink-50"
        >
          ← Kembali ke Home
        </Link>

        {/* DETAIL ANIME */}
        <section className="relative mt-6 overflow-hidden rounded-[28px] border border-pink-100 bg-white p-5 shadow-xl shadow-pink-100/60 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-purple-100/60 blur-3xl" />

          <div className="relative flex flex-col gap-7 md:flex-row">
            <div className="shrink-0">
              {manga.cover ? (
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="mx-auto aspect-[3/4] w-52 rounded-2xl border-4 border-white object-cover shadow-xl shadow-pink-200 sm:w-60 md:mx-0"
                />
              ) : (
                <div className="flex aspect-[3/4] w-52 items-center justify-center rounded-2xl bg-pink-100 text-pink-400">
                  Cover tidak tersedia
                </div>
              )}
            </div>

            <div className="relative min-w-0 flex-1 py-2">
              <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-pink-600">
                ✿ Anime Detail
              </span>

              <h1 className="mt-4 text-3xl font-black leading-tight text-[#583B50] sm:text-4xl lg:text-5xl">
                {manga.title}
              </h1>

              <p className="mt-4 inline-block rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-500">
                ♡ {manga.genre || "Genre belum tersedia"}
              </p>

              <div className="mt-7">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <span className="text-pink-500">♡</span>
                  Sinopsis
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[#92778A] sm:text-base">
                  {manga.synopsis}
                </p>
              </div>

              <a
                href="#episodes"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-7 py-3 font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                ▶ Mulai Menonton
              </a>
            </div>
          </div>
        </section>

        {/* KARAKTER DAN TRAILER */}
        <div className="mt-8">
          <AnimeCharacters animeId={manga.mal_id} />
          <AnimeTrailer title={manga.title} />
        </div>

        {/* VIDEO PLAYER */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-500">
              Now Playing ♡
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Nonton Anime
            </h2>
          </div>

          <div className="overflow-hidden rounded-[26px] border-4 border-white bg-[#211522] shadow-2xl shadow-pink-200/70">
            <div className="aspect-video w-full">
              {videoUrl ? (
                <iframe
                  key={`${selectedEpisode.id || selectedEpisode.episode}-${language}`}
                  src={videoUrl}
                  title={manga.title}
                  className="h-full w-full"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center text-white">
                  <span className="text-5xl">♡</span>
                  <p className="mt-3 text-xl font-bold">
                    Video tidak tersedia
                  </p>
                  <p className="mt-2 text-sm text-pink-200/60">
                    Pilih episode atau bahasa lain.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#2C1D30] p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-pink-300">
                  Sedang menonton
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  Episode{" "}
                  {selectedEpisode?.episode ||
                    selectedEpisode?.number ||
                    selectedEpisode?.id ||
                    "-"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("sub")}
                  disabled={!selectedEpisode?.embed_url?.sub}
                  className={`rounded-full px-6 py-2.5 text-sm font-black transition ${
                    language === "sub"
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  SUB
                </button>

                <button
                  onClick={() => setLanguage("dub")}
                  disabled={!selectedEpisode?.embed_url?.dub}
                  className={`rounded-full px-6 py-2.5 text-sm font-black transition ${
                    language === "dub"
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  DUB
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DAFTAR EPISODE */}
        <section id="episodes" className="mt-12 scroll-mt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-500">
                Choose Your Episode
              </p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Daftar Episode
              </h2>
            </div>

            <span className="rounded-full border border-pink-100 bg-white px-5 py-2.5 text-sm font-black text-pink-500 shadow-sm">
              ♡ {episodes.length} Episode
            </span>
          </div>

          {episodes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {episodes.map((episode, index) => {
                const episodeNumber =
                  episode.episode ||
                  episode.number ||
                  episode.id ||
                  index + 1;

                const isActive = selectedEpisode === episode;

                return (
                  <button
                    key={episode.id || episodeNumber}
                    onClick={() => {
                      setSelectedEpisode(episode);

                      if (!episode.embed_url?.[language]) {
                        setLanguage(
                          episode.embed_url?.sub ? "sub" : "dub"
                        );
                      }

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`group rounded-2xl border p-3 text-left transition duration-300 hover:-translate-y-1 sm:p-4 ${
                      isActive
                        ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-50 shadow-lg shadow-pink-200/70"
                        : "border-pink-100 bg-white shadow-sm hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black transition ${
                          isActive
                            ? "bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white shadow-md shadow-pink-200"
                            : "bg-pink-50 text-pink-500 group-hover:bg-pink-500 group-hover:text-white"
                        }`}
                      >
                        {episodeNumber}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#583B50]">
                          Episode {episodeNumber}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-pink-400">
                          {isActive ? "♡ Sedang diputar" : "▶ Tonton"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-pink-100 bg-white p-6 text-[#A17F94]">
              Episode belum tersedia.
            </p>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-16 border-t border-pink-100 py-8 text-center">
          <p className="text-sm font-bold text-pink-500">
            ♡ YZproject
          </p>
          <p className="mt-2 text-xs text-[#A17F94]">
            Made with love for anime lovers ✿
          </p>
        </footer>
      </div>
    </main>
  );
}

export default MangaDetail;