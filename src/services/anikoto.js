export async function getRecentAnime(page = 1, perPage = 50) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const response = await fetch(
    `/api/anikoto/recent-anime?${params.toString()}`
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Batas API tercapai. Silakan tunggu 120 detik."
      );
    }

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