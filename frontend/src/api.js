// ── URL ───────────────────────────────
const LOCAL_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";
const POCKETHOST_BASE_URL = "https://app-tracking.pockethost.io/api/collections/notes/records";

// ── Headers ───────────────────────────
/**
 * Build HTTP headers for API requests.
 * PocketHost requires Bearer token, local might not use token.
 * @param {string} token - Authentication token
 * @param {string} source - "local" or "pockethost"
 * @returns {Object} headers
 */
function buildHeaders(token, source) {
  const headers = { "Content-Type": "application/json" };
  if (token && source === "pockethost") {
    headers.Authorization = `Bearer ${token}`;
  } else if (token && source === "local") {
    headers.Authorization = token; // Optional for local if you want
  }
  return headers;
}

// ── Fetch notes ───────────────────────
export async function fetchNotes(token, source) {
  const url = source === "local" ? LOCAL_BASE_URL : `${POCKETHOST_BASE_URL}?perPage=500`;

  const headers = source === "local" ? { "Content-Type": "application/json" } : buildHeaders(token, source);

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Fetch notes error:", errText);
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  // Normalize data: PocketHost uses data.items, local returns array directly
  return Array.isArray(data) ? data : data.items ?? [];
}

// ── Create note ──────────────────────
export async function createNote(token, source, title, content) {
  const url = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL;

  const body = JSON.stringify({ title, content });

  const headers = source === "local" ? { "Content-Type": "application/json" } : buildHeaders(token, source);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Create note error:", errText);
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Delete note ──────────────────────
export async function deleteNote(token, source, id) {
  const baseUrl = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL;
  const url = `${baseUrl}/${id}`;

  const headers = source === "local" ? { "Content-Type": "application/json" } : buildHeaders(token, source);

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Delete note error:", errText);
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Update note ──────────────────────
export async function updateNote(token, source, id, title, content) {
  const url = `${LOCAL_BASE_URL}/${id}`;

  const headers = {
    "Content-Type": "application/json",
    "X-Data-Source": source,
  };
  if (token) headers.Authorization = source === "pockethost" ? `Bearer ${token}` : token;

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}