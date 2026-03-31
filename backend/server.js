require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// Path to save notes to a JSON file
const NOTES_FILE = path.join(__dirname, "notes.json");

// PocketHost base URL
const POCKETHOST_BASE_URL =
  "https://app-tracking.pockethost.io/api/collections/notes/records";

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Helpers: Local JSON ─────────────────────────────────
function readNotes() {
  if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
  }
  const raw = fs.readFileSync(NOTES_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// ── Middleware: Authorization ───────────────────────────
function authorize(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
  }
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  req.token = token;
  req.isLocal = token === SECRET_TOKEN;
  next();
}

// ── Helper for calling PocketHost. ───────────────────
async function callPocketHost(endpoint, token, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${process.env.BASE_URL}${endpoint}`, options);
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw { status: response.status, message: data };
  }
  return data;
}

async function fetchAllNotes(token, collection) {
  let allNotes = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await callPocketHost(
      `/api/collections/${collection}/records?perPage=30&page=${page}`,
      token
    );

    const items = data?.items || [];
    allNotes.push(...items);

    // PocketHost จะมี meta.totalPages
    totalPages = data?.meta?.totalPages || 1;
    page++;
  }

  return allNotes;
}

// ── GET /api/notes ──────────────────────────────────────
app.get("/api/notes", authorize, async (req, res) => {
  const source = req.headers["x-data-source"] || "local";
  const collection = process.env.COLLECTION || "notes";

  if (source === "pockethost") {
    try {
      const data = await fetchAllNotes(req.token, collection);
      return res.status(200).json({ items: data, totalItems: data.length });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ error: "Failed to fetch PocketHost notes", detail: err.message || err });
    }
  }

  const notes = readNotes();
  return res.status(200).json(notes);
});

// ── POST /api/notes ─────────────────────────────────────
app.post("/api/notes", authorize, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Bad Request: title and content are required" });
  }

  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
  try {
    const collection = process.env.COLLECTION || "notes";
    const data = await callPocketHost(
      `/api/collections/${collection}/records`,
      req.token,
      "POST",
      { title, content }
    );
    return res.status(201).json(data);
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ error: "Failed to create PocketHost note", detail: err.message || err });
  }
}

  if (!req.isLocal) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  const newNote = {
    id: uuidv4(),
    title,
    content,
    created: new Date().toISOString(),
  };
  const notes = readNotes();
  notes.push(newNote);
  writeNotes(notes);

  return res.status(201).json(newNote);
});

// ── DELETE /api/notes/:id ───────────────────────────────
app.delete("/api/notes/:id", authorize, async (req, res) => {
  const { id } = req.params;
  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
    try {
      const collection = process.env.COLLECTION || "notes";
      await callPocketHost(
        `/api/collections/${collection}/records/${id}`,
        req.token,
        "DELETE"
      );
      return res.status(200).json({ message: "Note deleted successfully" });
    } catch (err) {
      return res
        .status(err.status || 500)
        .json({ error: "Failed to delete PocketHost note", detail: err.message || err });
    }
  }

  if (!req.isLocal) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  const notes = readNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Not Found: Note does not exist" });
  }

  notes.splice(index, 1);
  writeNotes(notes);

  return res.status(200).json({ message: "Note deleted successfully" });
});

// ── Start Server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});