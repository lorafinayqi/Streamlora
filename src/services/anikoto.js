const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

async function cachedFetch(url) {
  const now = Date.now();
  const existing = cache.get(url);

  if (existing && now - existing.time < CACHE_DURATION) {
    return existing.data;
  }

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("Limit API tercapai. Tunggu 120 detik.");
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  if (data?.ok === false) {
    throw new Error(data.message || "API gagal mengambil data.");
  }

  cache.set(url, {
    data,
    time: Date.now(),
  });

  return data;
}

export async function getRecentAnime(page = 1, perPage = 50) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  return cachedFetch(
    `/api/anikoto/recent-anime?${params.toString()}`
  );
}

export async function getAnimeDetail(id) {
  if (!id) {
    throw new Error("ID anime tidak tersedia.");
  }

  return cachedFetch(
    `/api/anikoto/series/${encodeURIComponent(id)}`
  );
}

// Membantu mengambil ID dari objek anime
export function getAnimeId(anime) {
  return (
    anime?.id ??
    anime?.anime_id ??
    anime?.series_id ??
    anime?.seriesId ??
    null
  );
}