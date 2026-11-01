const API = "https://api.tenrai.org/v1";

export const mangaList = [
  {
    id: 1,
    title: "Hitoribocchi no Isekai Kouryaku",
    slug: "Hitoribocchi no Isekai Kouryaku",
  },
  {
    id: 2,
    title: "Girls & Panzer: Motto Love Love Sakusen desu!",
    slug: "Girls & Panzer: Motto Love Love Sakusen desu!",
  },
  {
    id: 3,
    title: "Otaku ni Yasashii Gal wa Inai?",
    slug: "Otaku ni Yasashii Gal wa Inai",
  },
  {
    id: 4,
    title: "Otome Game Sekai wa Mob ni Kibishii Sekai desu 2",
    slug: "Otome Game Sekai wa Mob ni Kibishii Sekai desu 2",
  },
  {
    id: 5,
    title: "Hanaori-san wa Tensei Shitemo Kenka ga Shitai",
    slug: "Hanaori-san wa Tensei",
  },
  {
    id: 6,
    title: "Seitokai ni mo Ana wa Aru!",
    slug: "Seitokai ni mo Ana wa Aru!",
  },
  {
    id: 7,
    title: "Chainsaw Man Movie: Reze-hen",
    slug: "Chainsaw Man Movie: Reze-hen",
  },
];

function normalizeTitle(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function fetchMangaList() {
  return Promise.all(
    mangaList.map(async (item) => {
      try {
        const response = await fetch(
          `${API}/anime?q=${encodeURIComponent(item.title)}`
        );

        if (!response.ok) throw new Error("API error");

        const result = await response.json();
        const results = result.data || [];

        const anime =
          results.find((entry) =>
            [
              entry.title,
              entry.title_english,
              entry.title_japanese,
            ].some(
              (name) =>
                name &&
                normalizeTitle(name) === normalizeTitle(item.title)
            )
          ) || results[0];

        if (!anime) return item;

        return {
          ...item,
          mal_id: anime.mal_id,
          title: anime.title || item.title,
          cover:
            anime.images?.jpg?.large_image_url ||
            anime.images?.jpg?.image_url ||
            "",
          genre: (anime.genres || [])
            .map((genre) => genre.name)
            .join(", "),
          synopsis: anime.synopsis || "Sinopsis belum tersedia.",
        };
      } catch (error) {
        console.error(`Gagal mengambil ${item.title}:`, error);
        return item;
      }
    })
  );
}