// ── URL ───────────────────────────────
const LOCAL_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";
const POCKETHOST_BASE_URL = "https://app-tracking.pockethost.io/api/collections/notes/records?perPage=500";

// ── Headers ───────────────────────────
function buildHeaders(token, source) {
  return {
    "Content-Type": "application/json",
    Authorization: token,
    "X-Data-Source": source,
  };
}

// ── Fetch notes ───────────────────────
export async function fetchNotes(token, source) {
  const url = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL;
  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token, source),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // PocketHost returns data.items, Local returns an array.
  return Array.isArray(data) ? data : data.items ?? [];
}

// ── Create note ──────────────────────
export async function createNote(token, source, title, content) {
  const url = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL.replace("?perPage=500", "");
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(token, source),
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Delete note ──────────────────────
export async function deleteNote(token, source, id) {
  const baseUrl = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL.replace("?perPage=500", "");
  const url = `${baseUrl}/${id}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(token, source),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}