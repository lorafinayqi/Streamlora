export async function getRecentAnime() {
  const response = await fetch("/api/anikoto/recent-anime");

  if (!response.ok) {
    throw new Error(`Gagal mengambil anime: ${response.status}`);
  }

  return response.json();
}

export async function getAnimeDetail(id) {
  const response = await fetch(
    `/api/anikoto/series/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(`Gagal mengambil detail: ${response.status}`);
  }

  return response.json();
}