const BASE_URL = "https://anikotoapi.site";

export default async function handler(req, res) {
  try {
    const path = req.query.path;

    if (!path) {
      return res.status(400).json({
        error: "Path API tidak ditemukan",
      });
    }

    const endpoint = Array.isArray(path)
      ? path.join("/")
      : path;

    const url = `${BASE_URL}/${endpoint}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Anikoto API Error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi Anikoto API",
    });
  }
}