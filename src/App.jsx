
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import MangaCard from "./components/MangaCard";
import MangaDetail from "./pages/MangaDetail";
import Reader from "./pages/Reader";

import { getRecentAnime } from "./services/anikoto";

function Home() {
  const [search, setSearch] = useState("");
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAnime() {
      try {
        setLoading(true);
        setError("");

        const result = await getRecentAnime();

        console.log("ANIKOTO RECENT ANIME:", result);

        // Menyesuaikan bentuk respons API
        const animeData = Array.isArray(result)
          ? result
          : result.data ||
            result.results ||
            result.anime ||
            [];

        if (!Array.isArray(animeData)) {
          throw new Error("Format data anime tidak valid.");
        }

        // Menyesuaikan data API dengan MangaCard
        const formattedAnime = animeData.map((anime, index) => ({
          ...anime,
          id: anime.id || anime.slug || index,
          slug: anime.slug || String(anime.id),
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
        }));

        if (active) {
          setMangaList(formattedAnime);
        }
      } catch (err) {
        console.error("Gagal mengambil anime:", err);

        if (active) {
          setError(err.message || "Gagal mengambil data anime.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnime();

    return () => {
      active = false;
    };
  }, []);

  const filteredManga = mangaList.filter((manga) =>
    manga.title.toLowerCase().includes(search.toLowerCase())
  );

  const displayedManga = search.trim()
    ? filteredManga
    : showAll
      ? filteredManga
      : filteredManga.slice(0, 6);

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
            Jelajahi berbagai judul Anime.
          </p>
        </section>

        {/* ANIME TERBARU */}
        <section id="latest">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#493545]">
              Anime Terbaru
            </h2>
          </div>

          {loading ? (
            <p className="py-10 text-center text-pink-500">
              Sedang memuat anime...
            </p>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-400">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-pink-500 px-6 py-2 font-semibold text-white hover:bg-pink-600"
              >
                Coba Lagi
              </button>
            </div>
          ) : displayedManga.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {displayedManga.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                  />
                ))}
              </div>

              {!search.trim() && filteredManga.length > 6 && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white shadow-md shadow-pink-200 transition hover:-translate-y-1 hover:bg-pink-600 hover:shadow-lg"
                  >
                    {showAll
                      ? "Tampilkan Lebih Sedikit ↑"
                      : "Lihat Semua Anime →"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-[#9B8292]">
              Anime tidak ditemukan.
            </p>
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
              <main className="p-10 text-center text-[#493545]">
                <h1 className="text-2xl font-bold">
                  Halaman tidak ditemukan
                </h1>

                <a
                  href="/"
                  className="mt-4 inline-block text-pink-500 hover:text-pink-700 hover:underline"
                >
                  Kembali ke Home
                </a>
              </main>
            }
          />
        </Routes>

        <footer className="border-t border-pink-100 px-4 py-8 text-center text-sm text-[#A18B9A]">
          YZProject
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;