require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fetch = require("node-fetch"); // ถ้า Node 18+ ไม่ต้องติดตั้ง เพิ่มได้

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const COLLECTION = process.env.COLLECTION || "notes";
const BASE_URL = process.env.BASE_URL || `https://app-tracking.pockethost.io/api/collections/${COLLECTION}/records`;

// ── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());

// ── Helpers: Local JSON ───────────────────────
const NOTES_FILE = path.join(__dirname, "notes.json");
function readNotes() {
  if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(NOTES_FILE, "utf-8"));
}
function writeNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// ── Middleware: Authorization ────────────────
function authorize(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  req.token = token;
  req.isLocal = token === SECRET_TOKEN;
  next();
}

// ── Helper: Call PocketHost API ─────────────
async function callPocketHost(endpoint, token, method = "GET", body = null) {
  const options = { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) throw { status: response.status, message: data };
  return data;
}

// ── Helper: Fetch all PocketHost notes (perPage=500) ─
async function fetchAllPocketNotes(token) {
  let allNotes = [];
  let page = 1;
  let totalPages = 1;

  // ตั้ง perPage=500 เพื่อดึงครั้งละมากๆ
  const perPage = 500;

  while (page <= totalPages) {
    const data = await callPocketHost(`?perPage=${perPage}&page=${page}`, token);
    const items = data.items || [];
    allNotes.push(...items);

    totalPages = data.meta?.totalPages || 1;
    page++;
  }
  return allNotes;
}

// ── GET /api/notes ───────────────────────────
app.get("/api/notes", authorize, async (req, res) => {
  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
    try {
      const notes = await fetchAllPocketNotes(req.token);
      return res.status(200).json({ items: notes, totalItems: notes.length });
    } catch (err) {
      return res.status(err.status || 500).json({ error: "Failed to fetch PocketHost notes", detail: err.message || err });
    }
  }

  // Local notes
  return res.status(200).json(readNotes());
});

// ── POST /api/notes ──────────────────────────
app.post("/api/notes", authorize, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "title and content are required" });

  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
    try {
      const data = await callPocketHost("", req.token, "POST", { title, content });
      return res.status(201).json(data);
    } catch (err) {
      return res.status(err.status || 500).json({ error: "Failed to create PocketHost note", detail: err.message || err });
    }
  }

  // Local notes
  if (!req.isLocal) return res.status(401).json({ error: "Invalid token" });

  const newNote = { id: uuidv4(), title, content, created: new Date().toISOString() };
  const notes = readNotes();
  notes.push(newNote);
  writeNotes(notes);
  return res.status(201).json(newNote);
});

// ── DELETE /api/notes/:id ─────────────────────
app.delete("/api/notes/:id", authorize, async (req, res) => {
  const { id } = req.params;
  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
    try {
      await callPocketHost(`/${id}`, req.token, "DELETE");
      return res.status(200).json({ message: "PocketHost note deleted" });
    } catch (err) {
      return res.status(err.status || 500).json({ error: "Failed to delete PocketHost note", detail: err.message || err });
    }
  }

  // Local notes
  if (!req.isLocal) return res.status(401).json({ error: "Invalid token" });

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "Note not found" });

  notes.splice(index, 1);
  writeNotes(notes);
  return res.status(200).json({ message: "Local note deleted" });
});

// ── Start Server ────────────────────────────
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));