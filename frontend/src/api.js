// api.js - Frontend API helper
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";

// ── Build headers ─────────────────────────────
function buildHeaders(token, source) {
  return {
    "Content-Type": "application/json",
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    "X-Data-Source": source, // "local" หรือ "pockethost"
  };
}

// ── Fetch all notes ───────────────────────────
export async function fetchNotes(token, source = "local") {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: buildHeaders(token, source),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // รองรับ backend ส่ง { items: [...] } หรือ array
  return Array.isArray(data) ? data : data.items ?? [];
}

// ── Create a new note ────────────────────────
export async function createNote(token, source = "local", title, content) {
  const res = await fetch(BASE_URL, {
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

// ── Delete a note ────────────────────────────
export async function deleteNote(token, source = "local", id) {
  const url = `${BASE_URL}/${id}`;
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

// ── Optional: Fetch a single note by ID ──────
export async function fetchNoteById(token, source = "local", id) {
  const url = `${BASE_URL}/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token, source),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}