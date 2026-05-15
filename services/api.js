const API_BASE_URL = "http://localhost:3000/api/v1";

const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.XzMXe6mosyQyDkynFFqMXpggArBY8q9qrErV_OuVbgk";

/* CORE REQUEST WRAPPER */
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        ...(options.headers || {}),
      },
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(
        data?.message || "API request failed"
      );
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error.message);
    throw error;
  }
}

/* FETCH CLIPS */
export async function fetchClips() {
  const data = await request(`${API_BASE_URL}/clips`, {
    method: "GET",
  });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clips)) return data.clips;

  return [];
}

/* DELETE CLIP */
export async function deleteClipApi(id) {
  return await request(`${API_BASE_URL}/clips/${id}`, {
    method: "DELETE",
  });
}

/* TOGGLE FAVORITE */
export async function toggleFavoriteApi(id) {
  return await request(
    `${API_BASE_URL}/clips/${id}/toggle_favorite`,
    {
      method: "PATCH",
    }
  );
}

/* CREATE CLIP (future-safe) */
export async function createClipApi(payload) {
  return await request(`${API_BASE_URL}/clips`, {
    method: "POST",
    body: JSON.stringify({ clip: payload }),
  });
}