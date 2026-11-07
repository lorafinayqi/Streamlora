import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import MangaCard from "./components/MangaCard";
import MangaDetail from "./pages/MangaDetail";
import Reader from "./pages/Reader";

import { getRecentAnime } from "./services/anikoto";

const PER_PAGE = 24;
const SEARCH_DELAY = 400;

function Home() {
  const [search, setSearch] = useState("");
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const cacheRef = useRef(new Set());
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);

  // Mengambil satu halaman API.
  const loadAnime = useCallback(async (nextPage) => {
    if (
      loadingRef.current ||
      !hasMoreRef.current ||
      cacheRef.current.has(nextPage)
    ) {
      return;
    }

    loadingRef.current = true;

    if (nextPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError("");

    try {
      const result = await getRecentAnime(nextPage, PER_PAGE);

      const payload = result?.data;

      const animeData = Array.isArray(result)
        ? result
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload?.anime)
              ? payload.anime
              : Array.isArray(result?.results)
                ? result.results
                : Array.isArray(result?.anime)
                  ? result.anime
                  : [];

      if (!Array.isArray(animeData)) {
        throw new Error("Format data anime tidak valid.");
      }

      const formattedAnime = animeData.map((anime, index) => {
        const id =
          anime.id ??
          anime.anime_id ??
          anime.series_id ??
          anime.seriesId ??
          anime.slug ??
          `${nextPage}-${index}`;

        return {
          ...anime,
          id,
          slug: anime.slug || String(id),
          title:
            anime.title ||
            anime.name ||
            "Anime Tanpa Judul",
          cover:
            anime.poster ||
            anime.cover ||
            anime.image ||
            anime.thumbnail ||
            "",
        };
      });

      cacheRef.current.add(nextPage);

      setMangaList((previous) => {
        const unique = new Map();

        [...previous, ...formattedAnime].forEach((anime) => {
          unique.set(String(anime.id), anime);
        });

        return Array.from(unique.values());
      });

      const pagination =
        result?.pagination ||
        payload?.pagination ||
        result?.meta?.pagination;

      const currentPage = Number(
        pagination?.currentPage ??
        pagination?.current_page ??
        nextPage
      );

      const totalPages = Number(
        pagination?.totalPages ??
        pagination?.total_pages ??
        pagination?.last_page
      );

      let moreAvailable;

      if (typeof pagination?.hasNext === "boolean") {
        moreAvailable = pagination.hasNext;
      } else if (
        Number.isFinite(totalPages) &&
        totalPages > 0
      ) {
        moreAvailable = currentPage < totalPages;
      } else {
        moreAvailable = animeData.length === PER_PAGE;
      }

      pageRef.current = nextPage;
      setPage(nextPage);

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);

    } catch (err) {
      console.error("Gagal mengambil anime:", err);

      setError(
        err.message || "Gagal mengambil data anime."
      );

    } finally {
      loadingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Ambil halaman pertama.
  useEffect(() => {
    loadAnime(1);
  }, [loadAnime]);

  // Pencarian otomatis ke seluruh halaman API.
  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (
      !keyword ||
      loading ||
      loadingMore ||
      loadingRef.current ||
      error ||
      !hasMore
    ) {
      return;
    }

    const timer = setTimeout(() => {
      if (
        loadingRef.current ||
        !hasMoreRef.current
      ) {
        return;
      }

      // Tetap lanjut mencari meskipun sudah ada hasil.
      loadAnime(pageRef.current + 1);

    }, SEARCH_DELAY);

    return () => clearTimeout(timer);

  }, [
    search,
    mangaList,
    loading,
    loadingMore,
    hasMore,
    error,
    loadAnime,
  ]);

  // Mengambil semua kemungkinan judul anime.
  function getSearchText(anime) {
    const alternativeTitles = anime.alternative_titles;

    const alternatives = Array.isArray(alternativeTitles)
      ? alternativeTitles
          .map((item) =>
            typeof item === "string"
              ? item
              : item?.title || item?.name || ""
          )
          .join(" ")
      : typeof alternativeTitles === "string"
        ? alternativeTitles
        : "";

    return [
      anime.title,
      anime.name,
      anime.title_english,
      anime.title_japanese,
      anime.english_title,
      anime.japanese_title,
      anime.synonyms,
      alternatives,
    ]
      .flat()
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  // Filter seluruh anime yang sudah ditemukan.
  const keyword = search.trim().toLowerCase();

  const filteredManga = keyword
    ? mangaList.filter((anime) =>
        getSearchText(anime).includes(keyword)
      )
    : mangaList;

  return (
    <>
      <Navbar search={search} setSearch={setSearch} />

      <main className="mx-auto max-w-7xl px-4 py-8">

        {/* HERO */}
        <section className="mb-10 rounded-2xl bg-gradient-to-r from-pink-200 via-pink-100 to-white p-6 text-[#493545] shadow-sm sm:p-10">

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-pink-600">
            Your Anime Destination
          </p>

          <h1 className="text-3xl font-black sm:text-5xl">
            Temukan Anime Favoritmu
          </h1>

          <p className="mt-4 text-[#765D6D]">
            Jelajahi berbagai judul anime favoritmu.
          </p>

        </section>

        {/* ANIME */}
        <section id="latest">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-[#493545]">
              {keyword ? "Hasil Pencarian" : "Anime Terbaru"}
            </h2>

            <p className="mt-1 text-sm text-[#9B8292]">
              {filteredManga.length} hasil ·{" "}
              {mangaList.length} anime ditemukan
            </p>

          </div>

          {loading ? (

            <p className="py-10 text-center text-pink-500">
              Sedang memuat anime...
            </p>

          ) : (

            <>

              {error && (
                <div className="py-6 text-center">

                  <p className="text-red-400">
                    {error}
                  </p>

                  <button
                    onClick={() => {
                      setError("");
                      loadAnime(pageRef.current + 1);
                    }}
                    className="mt-3 rounded-full bg-pink-500 px-6 py-2 text-white hover:bg-pink-600"
                  >
                    Coba Lagi
                  </button>

                </div>
              )}

              {filteredManga.length > 0 ? (

                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

                  {filteredManga.map((anime) => (
                    <MangaCard
                      key={anime.id}
                      manga={anime}
                    />
                  ))}

                </div>

              ) : (

                <div className="py-10 text-center">

                  <p className="text-[#9B8292]">
                    {keyword
                      ? `Anime "${search}" belum ditemukan.`
                      : "Belum ada anime tersedia."}
                  </p>

                </div>

              )}

              {/* STATUS PENCARIAN */}
              {keyword && loadingMore && (

                <p className="mt-8 text-center font-semibold text-pink-500">
                  <span className="mr-2 inline-block animate-spin">♡</span>
                  Sedang mencari "{search}" di seluruh katalog...
                </p>

              )}

              {keyword && !loadingMore && !hasMore && !error && (

                <p className="mt-8 text-center text-sm text-[#A18B9A]">
                  Pencarian selesai. Semua halaman katalog yang tersedia
                  sudah diperiksa. ♡
                </p>

              )}

              {/* LOAD MORE MANUAL */}
              {!keyword && hasMore && (

                <div className="mt-10 flex justify-center">

                  <button
                    onClick={() => loadAnime(pageRef.current + 1)}
                    disabled={loadingMore}
                    className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white shadow-md shadow-pink-200 transition hover:-translate-y-1 hover:bg-pink-600 disabled:opacity-60"
                  >
                    {loadingMore
                      ? "Sedang Memuat..."
                      : "Muat 24 Anime Lagi ↓"}
                  </button>

                </div>

              )}

              {!hasMore && !keyword && (

                <p className="mt-10 text-center text-sm text-[#A18B9A]">
                  Semua katalog sudah dimuat ♡
                </p>

              )}

            </>

          )}

        </section>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>

      <div className="min-h-screen bg-[#FFF7FB] text-[#493545]">

        <Routes>

          <Route path="/" element={<Home />} />

          <Route
            path="/manga/:slug"
            element={<MangaDetail />}
          />

          <Route
            path="/manga/:slug/:chapter"
            element={<Reader />}
          />

          <Route
            path="*"
            element={
              <main className="p-10 text-center">

                <h1 className="text-2xl font-bold">
                  Halaman tidak ditemukan
                </h1>

                <a
                  href="/"
                  className="mt-4 inline-block text-pink-500"
                >
                  Kembali ke Home
                </a>

              </main>
            }
          />

        </Routes>

        <footer className="border-t border-pink-100 px-4 py-8 text-center text-sm text-[#A18B9A]">
          Streamlora ♡
        </footer>

      </div>

    </BrowserRouter>
  );
}

export default App;