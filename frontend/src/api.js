// ── URL ───────────────────────────────
// Local API endpoint (from environment variable or fallback to localhost)
const LOCAL_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";

// PocketHost API endpoint for notes collection
const POCKETHOST_BASE_URL = "https://app-tracking.pockethost.io/api/collections/notes/records";

// ── Headers ───────────────────────────
/**
 * Build HTTP headers for API requests.
 * PocketHost requires Bearer token, local API might use plain token.
 * @param {string} token - Authentication token
 * @param {string} source - "local" or "pockethost"
 * @returns {Object} headers
 */
function buildHeaders(token, source) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = source === "pockethost" ? `Bearer ${token}` : token;
  }
  return headers;
}

// ── Fetch notes ───────────────────────
/**
 * Fetch all notes from the specified source.
 * Local returns array, PocketHost returns { items: [...] }.
 * Safely handles empty response or non-JSON response.
 * @param {string} token
 * @param {string} source
 * @returns {Array} array of notes
 */
export async function fetchNotes(token, source) {
  const url = source === "local" ? LOCAL_BASE_URL : `${POCKETHOST_BASE_URL}?perPage=500`;

  const res = await fetch(url, {
    method: "GET",
    headers: buildHeaders(token, source),
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
/**
 * Create a new note on the specified source.
 * Make sure to match the request body fields with PocketHost collection schema.
 * Safely handles empty or non-JSON response.
 * @param {string} token
 * @param {string} source
 * @param {string} title
 * @param {string} content
 * @returns {Object|null} created note or null if response empty
 */
export async function createNote(token, source, title, content) {
  const url = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL;

  const body = JSON.stringify({ title, content });

  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(token, source),
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
/**
 * Delete a note by ID from the specified source.
 * Safely handles empty response (some APIs return 204 No Content).
 * @param {string} token
 * @param {string} source
 * @param {string} id - Note ID to delete
 * @returns {Object|null} deletion response or null if empty
 */
export async function deleteNote(token, source, id) {
  const baseUrl = source === "local" ? LOCAL_BASE_URL : POCKETHOST_BASE_URL;
  const url = `${baseUrl}/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: buildHeaders(token, source),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Delete note error:", errText);
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}