const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";

function buildHeaders(token, source) {
  return {
    "Content-Type": "application/json",
    Authorization: token,
    "X-Data-Source": source,
  };
}

export async function fetchNotes(token, source) {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: buildHeaders(token, source),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function createNote(token, source, title, content) {
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

export async function deleteNote(token, source, id) {
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