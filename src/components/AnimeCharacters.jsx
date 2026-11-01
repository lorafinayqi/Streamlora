import { useEffect, useState } from "react";

const API = "https://api.tenrai.org/v1";

function AnimeCharacters({ animeId }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!animeId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchCharacters() {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(
          `${API}/anime/${animeId}/characters`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil karakter");
        }

        const result = await response.json();
        setCharacters(result.data || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCharacters();

    return () => controller.abort();
  }, [animeId]);

  return (
    <section className="mt-10">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#493545]">
          Karakter & Voice Actor
        </h2>
        <p className="mt-1 text-sm text-[#9B8292]">
          Geser untuk melihat karakter lainnya.
        </p>
      </div>

      {loading ? (
        <p className="rounded-xl bg-white p-5 text-pink-500">
          Memuat karakter...
        </p>
      ) : error ? (
        <p className="rounded-xl bg-white p-5 text-[#9B8292]">
          Gagal memuat karakter.
        </p>
      ) : characters.length > 0 ? (
        <div className="relative">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4"
          >
            {characters.map((item) => {
              const character = item.character;
              const japaneseVA = (item.voice_actors || []).filter(
                (voice) => voice.language === "Japanese"
              );

              return (
                <div
                  key={character.mal_id}
                  className="w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:shadow-md hover:shadow-pink-100"
                >
                  <div className="flex gap-3 p-4">
                    <img
                      src={
                        character.images?.jpg?.image_url ||
                        "https://placehold.co/100x140?text=No+Image"
                      }
                      alt={character.name}
                      loading="lazy"
                      className="h-32 w-24 shrink-0 rounded-xl object-cover"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
                        {item.role || "Character"}
                      </p>

                      <h3 className="mt-1 font-bold text-[#493545]">
                        {character.name}
                      </h3>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[#9B8292]">
                          Japanese Voice Actor
                        </p>

                        {japaneseVA.length > 0 ? (
                          japaneseVA.map((voice) => (
                            <div
                              key={voice.person.mal_id}
                              className="mt-2 flex items-center gap-2"
                            >
                              <img
                                src={
                                  voice.person.images?.jpg?.image_url ||
                                  "https://placehold.co/40x40?text=VA"
                                }
                                alt={voice.person.name}
                                loading="lazy"
                                className="h-9 w-9 rounded-full object-cover"
                              />

                              <p className="text-xs font-medium text-[#493545]">
                                {voice.person.name}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="mt-2 text-xs text-[#9B8292]">
                            Belum tersedia.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-white p-5 text-[#9B8292]">
          Informasi karakter belum tersedia.
        </p>
      )}
    </section>
  );
}

export default AnimeCharacters;