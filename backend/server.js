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
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://secure-note-app-five.vercel.app",
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Data-Source"],
}));
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

// ── GET /api/notes ──────────────────────────────────────
app.get("/api/notes", async (req, res) => {
  const source = req.headers["x-data-source"] || "local";

  if (source === "pockethost") {
    const authHeader = req.headers["authorization"];
    const rawToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    try {
      const response = await fetch(POCKETHOST_BASE_URL, {
        headers: {
          Authorization: `Bearer ${rawToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to reach PocketHost" });
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
      const response = await fetch(POCKETHOST_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, user_id: 2 }),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to reach PocketHost" });
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
      const response = await fetch(`${POCKETHOST_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${req.token}` },
      });
      if (response.status === 204) {
        return res.status(200).json({ message: "Note deleted" });
      }
      const data = await response.json().catch(() => ({}));
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Failed to reach PocketHost" });
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