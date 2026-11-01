import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import MangaCard from "./components/MangaCard";
import MangaDetail from "./pages/MangaDetail";
import Reader from "./pages/Reader";

import { getRecentAnime } from "./services/anikoto";

const PER_PAGE = 24;
const SEARCH_DELAY = 2500;

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
  const searchRef = useRef("");

  // Ambil satu halaman anime dan simpan ke cache.
  async function loadAnime(nextPage) {
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
          anime.slug ??
          anime.anime_id ??
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

      // Tandai halaman sudah pernah dimuat.
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

      const currentPage =
        pagination?.currentPage ??
        pagination?.current_page;

      const totalPages =
        pagination?.totalPages ??
        pagination?.total_pages ??
        pagination?.last_page;

      let moreAvailable;

      if (typeof pagination?.hasNext === "boolean") {
        moreAvailable = pagination.hasNext;
      } else if (
        typeof currentPage === "number" &&
        typeof totalPages === "number"
      ) {
        moreAvailable = currentPage < totalPages;
      } else {
        moreAvailable = animeData.length === PER_PAGE;
      }

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);

      pageRef.current = nextPage;
      setPage(nextPage);
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
  }

  // Muat 24 anime pertama saat Home dibuka.
  useEffect(() => {
    loadAnime(1);
  }, []);

  // Simpan keyword terbaru agar pencarian selalu memakai nilai terkini.
  useEffect(() => {
    searchRef.current = search.trim().toLowerCase();
  }, [search]);

  // Cari otomatis di katalog jika belum ditemukan.
  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword || loading || error || !hasMore) {
      return;
    }

    const found = mangaList.some((anime) =>
      anime.title.toLowerCase().includes(keyword)
    );

    if (found) return;

    const timer = setTimeout(() => {
      if (
        searchRef.current !== keyword ||
        loadingRef.current ||
        !hasMoreRef.current
      ) {
        return;
      }

      loadAnime(pageRef.current + 1);
    }, SEARCH_DELAY);

    return () => clearTimeout(timer);
  }, [search, mangaList, loading, loadingMore, hasMore, error]);

  // Hasil pencarian dari seluruh anime yang sudah tersimpan.
  const filteredManga = mangaList.filter((anime) =>
    anime.title
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <>
      <Navbar search={search} setSearch={setSearch} />

      <main className="mx-auto max-w-7xl px-4 py-8">

        {/* HERO */}
        <section className="mb-10 rounded-2xl bg-linear-to-r from-pink-200 via-pink-100 to-white p-6 text-[#493545] shadow-sm sm:p-10">
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
              {search.trim()
                ? "Hasil Pencarian"
                : "Anime Terbaru"}
            </h2>

            <p className="mt-1 text-sm text-[#9B8292]">
              {filteredManga.length} hasil · {mangaList.length} anime tersimpan
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
                  <p className="text-red-400">{error}</p>

                  <button
                    onClick={() => loadAnime(pageRef.current + 1)}
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
                    {search.trim()
                      ? `Anime "${search}" belum ditemukan.`
                      : "Belum ada anime tersedia."}
                  </p>
                </div>
              )}

              {/* STATUS PENCARIAN */}
              {search.trim() && loadingMore && (
                <p className="mt-8 text-center text-pink-500">
                  Sedang mencari "{search}" di katalog anime... ♡
                </p>
              )}

              {search.trim() && !loadingMore && !filteredManga.length && !hasMore && (
                <p className="mt-4 text-center text-sm text-[#A18B9A]">
                  Anime tidak ditemukan. Semua katalog sudah diperiksa.
                </p>
              )}

              {/* TOMBOL MUAT ANIME */}
              {!search.trim() && hasMore && (
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

              {!hasMore && (
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