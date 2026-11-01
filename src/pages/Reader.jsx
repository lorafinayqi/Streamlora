import { Link, useParams } from "react-router-dom";
import { mangaList } from "../data/manga";

function Reader() {
  const { slug, chapter } = useParams();

  const manga = mangaList.find((item) => item.slug === slug);

  if (!manga) {
    return (
      <main className="min-h-screen bg-black p-10 text-center text-white">
        <h1 className="text-2xl font-bold">
          Manga tidak ditemukan.
        </h1>

        <Link
          to="/"
          className="mt-4 inline-block text-orange-400 hover:underline"
        >
          Kembali ke Home
        </Link>
      </main>
    );
  }

  const chapterNumber = Number(
    chapter?.match(/\d+/)?.[0] ?? 1
  );

  const previousChapter = Math.max(1, chapterNumber - 1);
  const nextChapter = chapterNumber + 1;

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          to={`/manga/${slug}`}
          className="text-orange-400 hover:underline"
        >
          ← Kembali ke {manga.title}
        </Link>

        <h1 className="mt-5 text-2xl font-bold">
          {manga.title}
        </h1>

        <p className="mt-2 text-gray-400">
          Chapter {chapterNumber}
        </p>

        <section className="my-8 rounded-xl bg-gray-900 p-8 text-center sm:p-12">
          <div className="text-5xl">📖</div>

          <h2 className="mt-4 text-xl font-semibold">
            Reader Manga
          </h2>

          <p className="mt-2 text-gray-400">
            Kamu sedang membaca {manga.title}, Chapter{" "}
            {chapterNumber}.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Gambar halaman akan ditampilkan setelah data chapter tersedia.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/manga/${slug}/chapter-${previousChapter}`}
            className="rounded-lg bg-gray-800 px-4 py-3 text-sm hover:bg-gray-700"
          >
            ← Sebelumnya
          </Link>

          <Link
            to={`/manga/${slug}`}
            className="rounded-lg bg-gray-800 px-4 py-3 text-sm hover:bg-gray-700"
          >
            Daftar Chapter
          </Link>

          <Link
            to={`/manga/${slug}/chapter-${nextChapter}`}
            className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold hover:bg-orange-600"
          >
            Berikutnya →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Reader;