import { useState, useEffect, useCallback } from "react";
import { fetchNotes, createNote, deleteNote } from "./api";

// ── Icons ──────────────────────────────────────────────────────
const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3l18 18M10.584 10.587A3 3 0 0012 15a3 3 0 002.413-4.416M9.88 5.092A9.77 9.77 0 0112 5.25c6 0 9.75 6.75 9.75 6.75a17.57 17.57 0 01-3.06 3.842M6.53 6.53A17.563 17.563 0 002.25 12s3.75 6.75 9.75 6.75c1.757 0 3.314-.426 4.64-1.126" />
  </svg>
);

const MAX_CHARS = 500;

const NOTE_COLORS = [
  { bg: "bg-white dark:bg-neutral-900", accent: "#737373" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", accent: "#f59e0b" },
  { bg: "bg-blue-50 dark:bg-blue-950/40", accent: "#3b82f6" },
  { bg: "bg-green-50 dark:bg-green-950/40", accent: "#22c55e" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", accent: "#f43f5e" },
  { bg: "bg-purple-50 dark:bg-purple-950/40", accent: "#a855f7" },
];

// ── NoteCard ───────────────────────────────────────────────────
function NoteCard({ note, onDelete, isDark, isDeleting }) {
  const colorObj = NOTE_COLORS[note.colorIndex ?? 0] ?? NOTE_COLORS[0];

  const dateStr = note.created
    ? new Date(note.created).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";
  const timeStr = note.created
    ? new Date(note.created).toLocaleTimeString("th-TH", {
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div className={`group relative rounded-2xl border transition-all duration-200
      aspect-square flex flex-col overflow-hidden
      ${colorObj.bg}
      ${isDark ? "border-neutral-800 hover:border-neutral-600" : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"}`}>

      {/* Color accent bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: colorObj.accent }} />

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-semibold text-sm leading-snug break-words flex-1 line-clamp-2
            ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
            {note.title}
          </h3>
          <button
            onClick={() => onDelete(note.id)}
            disabled={isDeleting}
            className={`flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100
              transition-all duration-150
              ${isDark
                ? "text-neutral-600 hover:text-red-400 hover:bg-red-900/20"
                : "text-neutral-400 hover:text-red-500 hover:bg-red-50"
              } disabled:opacity-30`}
          >
            {isDeleting ? <IconSpinner /> : <IconTrash />}
          </button>
        </div>

        <p className={`text-xs leading-relaxed break-words line-clamp-5 flex-1
          ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
          {note.content}
        </p>

        {/* Timestamp */}
        <div className={`mt-3 flex items-center gap-1 text-xs font-mono flex-shrink-0
          ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
          <span>{dateStr}</span>
          {timeStr && <span className="opacity-60">· {timeStr}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Create Note Overlay ────────────────────────────────────────
function CreateOverlay({ show, onClose, onSave, isDark }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset when opened
  useEffect(() => {
    if (show) { setTitle(""); setContent(""); setSelectedColor(0); setError(""); }
  }, [show]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const success = await onSave(title.trim(), content.trim(), selectedColor);
    setIsSubmitting(false);
    if (success) onClose();
    else setError("Failed to save. Check your token.");
  }

  const overlayBg = isDark ? "bg-neutral-950" : "bg-white";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-500" : "text-neutral-400";
  const divider = isDark ? "bg-neutral-800" : "bg-neutral-100";

  return (
    <div className={`fixed inset-0 z-50 flex flex-col p-6 sm:p-10
      transition-all duration-300 ease-out
      ${overlayBg}
      ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}>

      {/* Top bar */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onClose}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
            transition-all duration-150
            ${isDark ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
        >
          ✕
        </button>
        <span className={`text-sm font-medium ${textSecondary}`}>New Note</span>
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium
            transition-all duration-150 disabled:opacity-40
            ${isDark ? "bg-neutral-100 text-neutral-900 hover:bg-white" : "bg-neutral-900 text-white hover:bg-neutral-700"}`}
        >
          {isSubmitting ? <IconSpinner /> : "✓"}
        </button>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        autoFocus
        className={`text-2xl sm:text-3xl font-bold mb-4 outline-none bg-transparent
          placeholder-neutral-300 dark:placeholder-neutral-700 ${textPrimary}`}
      />

      {/* Divider */}
      <div className={`h-px w-full mb-4 ${divider}`} />

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setContent(e.target.value); }}
        placeholder="Start writing..."
        className={`flex-1 outline-none text-sm bg-transparent resize-none leading-relaxed
          placeholder-neutral-300 dark:placeholder-neutral-700 ${textPrimary}`}
      />

      {/* Bottom bar */}
      <div className="mt-4 flex items-center justify-between">
        {/* Color picker */}
        <div className="flex items-center gap-2">
          {NOTE_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedColor(i)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-150
                ${selectedColor === i
                  ? isDark ? "border-white scale-110" : "border-neutral-900 scale-110"
                  : "border-transparent hover:scale-105"
                }`}
              style={{ backgroundColor: c.accent }}
            />
          ))}
        </div>

        {/* Char count */}
        <span className={`text-xs font-mono
          ${content.length >= MAX_CHARS ? "text-red-400" : textSecondary}`}>
          {content.length}/{MAX_CHARS}
        </span>
      </div>

      {error && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState([]);
const [search, setSearch] = useState("");
const [showOverlay, setShowOverlay] = useState(false);
const [showConfig, setShowConfig] = useState(false);
const [isFetching, setIsFetching] = useState(false);
const [deletingId, setDeletingId] = useState(null);
const [error, setError] = useState("");
const [showToken, setShowToken] = useState(false);

// ── Persistent state (localStorage) ──
const [isDark, setIsDark] = useState(
  () => localStorage.getItem("sn_dark") === "true"
);
const [source, setSource] = useState(
  () => localStorage.getItem("sn_source") || "local"
);
const [localToken, setLocalToken] = useState(
  () => sessionStorage.getItem("sn_token_local") || ""
);
const [pocketToken, setPocketToken] = useState(
  () => sessionStorage.getItem("sn_token_pocket") || ""
);

// token ที่ใช้งานจริงตาม source ปัจจุบัน
const token = source === "local" ? localToken : pocketToken;

// ── Persist dark mode ──
useEffect(() => {
  localStorage.setItem("sn_dark", isDark);
  document.documentElement.classList.toggle("dark", isDark);
}, [isDark]);

// ── Persist source ──
useEffect(() => {
  localStorage.setItem("sn_source", source);
}, [source]);

// ── Persist tokens (sessionStorage = จำจนกว่า tab จะปิด/Render shutdown) ──
useEffect(() => {
  sessionStorage.setItem("sn_token_local", localToken);
}, [localToken]);

useEffect(() => {
  sessionStorage.setItem("sn_token_pocket", pocketToken);
}, [pocketToken]);

  // ── Fetch notes ──
  const loadNotes = useCallback(async () => {
    setIsFetching(true);
    setError("");
    try {
      const data = await fetchNotes(token, source);
      const colorMap = JSON.parse(localStorage.getItem("sn_colors") || "{}");
      const notesWithColors = data.map((n) => ({
        ...n,
        colorIndex: colorMap[n.id] ?? 0,
      }));
      setNotes(notesWithColors);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  }, [token, source]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // ── Create note (called from overlay) ──
  const handleCreate = useCallback(async (title, content, colorIndex) => {
  if (!token.trim()) return false;
  try {
    const newNote = await createNote(token, source, title, content);
    const noteWithColor = { ...newNote, colorIndex };
    // บันทึก color mapping ลง localStorage
    const colorMap = JSON.parse(localStorage.getItem("sn_colors") || "{}");
    colorMap[newNote.id] = colorIndex;
    localStorage.setItem("sn_colors", JSON.stringify(colorMap));
    setNotes((prev) => [noteWithColor, ...prev]);
    return true;
  } catch {
    return false;
  }
  }, [token, source]);

  // ── Delete note ──
  async function handleDelete(id) {
    if (!token.trim()) { setError("Token is required."); return; }
    setDeletingId(id);
    try {
      await deleteNote(token, source, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  // ── Theme ──
  const bg = isDark ? "bg-neutral-950" : "bg-neutral-50";
  const topbarBg = isDark ? "bg-neutral-950/90 border-neutral-800" : "bg-neutral-50/90 border-neutral-200";
  const sidebarBg = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-500" : "text-neutral-500";
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-colors duration-200 outline-none
    ${isDark
      ? "bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500"
      : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400"
    }`;

  return (
    <>
      {/* Global smooth transition */}
      <style>{`
        *, *::before, *::after {
          transition-property: background-color, border-color, color;
          transition-duration: 250ms;
          transition-timing-function: ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .note-card-enter { animation: slideUp 0.25s ease-out; }
      `}</style>

      <div className={`min-h-screen ${bg} flex flex-col`} style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top Bar ── */}
        <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${topbarBg}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

            {/* Logo */}
            <span className={`font-bold text-base mr-2 ${textPrimary}`}>SecureNote</span>

            {/* Search */}
            <div className={`flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg border
              ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
              <IconSearch />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className={`flex-1 text-sm bg-transparent outline-none
                  ${isDark ? "text-neutral-100 placeholder-neutral-600" : "text-neutral-900 placeholder-neutral-400"}`}
              />
              {search && (
                <button onClick={() => setSearch("")} className={`text-xs ${textSecondary} hover:text-red-400`}>✕</button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Note count */}
              <span className={`text-xs font-mono hidden sm:block ${textSecondary}`}>
                {filteredNotes.length} notes
              </span>

              {/* Refresh */}
              <button onClick={loadNotes} disabled={isFetching}
                className={`p-2 rounded-lg transition-colors
                  ${isDark ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                    : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                  } disabled:opacity-40`}>
                {isFetching
                  ? <IconSpinner />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                }
              </button>

              {/* Config toggle */}
              <button onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded-lg transition-colors
                  ${showConfig
                    ? isDark ? "bg-neutral-800 text-neutral-200" : "bg-neutral-100 text-neutral-700"
                    : isDark ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                      : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                  }`}>
                <IconKey />
              </button>

              {/* Dark mode */}
              <button onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-lg transition-colors
                  ${isDark ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                    : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}>
                {isDark ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </div>

          {/* Config Panel (collapsible) */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out
            ${showConfig ? "max-h-40" : "max-h-0"}`}>
            <div className={`px-4 sm:px-6 py-4 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Source toggle */}
                <div className={`flex rounded-lg p-0.5 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
                  {["local", "pockethost"].map((s) => (
                    <button key={s} onClick={() => setSource(s)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                        ${source === s
                          ? isDark ? "bg-neutral-700 text-neutral-100" : "bg-white text-neutral-900 shadow-sm"
                          : textSecondary}`}>
                      {s === "local" ? "Local" : "PocketHost"}
                    </button>
                  ))}
                </div>
                {/* Token */}
                  <div className="relative w-full max-w-sm">
                    <input
                      type={showToken ? "text" : "password"}
                      value={source === "local" ? localToken : pocketToken}
                      onChange={(e) => {
                        if (source === "local") {
                          setLocalToken(e.target.value);
                        } else {
                          setPocketToken(e.target.value);
                        }
                      }}
                      placeholder={source === "local" ? "SECRET_TOKEN" : "PocketHost token"}
                      className={`${inputClass} pr-10`}
                      onCopy={(e) => {
                        if (!showToken) e.preventDefault();
                      }}
                      onSelect={(e) => {
                        if (!showToken) e.target.setSelectionRange(0, 0);
                      }}
                      style={{
                        userSelect: showToken ? "auto" : "none",
                        caretColor: showToken ? "auto" : "transparent",
                      }}
                    />
                    {/* Button Eyes */}
                    <button
                      type="button"
                      onClick={() => setShowToken((prev) => !prev)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md
                        transition-colors
                        ${isDark
                          ? "text-neutral-500 hover:text-neutral-300"
                          : "text-neutral-400 hover:text-neutral-600"
                        }`}
                    >
                      {showToken ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                <p className={`text-xs ${textSecondary}`}>
                  {source === "local" ? "Required for create & delete" : "Required for all operations"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Loading skeleton */}
          {isFetching && notes.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className={`aspect-square rounded-2xl border animate-pulse
                  ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isFetching && filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-4xl mb-3">{search ? "🔍" : "📝"}</p>
              <p className={`text-sm font-medium mb-1 ${textPrimary}`}>
                {search ? `No results for "${search}"` : "No notes yet"}
              </p>
              <p className={`text-xs ${textSecondary}`}>
                {search ? "Try a different keyword" : "Tap + to create your first note"}
              </p>
            </div>
          )}

          {/* Notes grid — Responsive */}
          {filteredNotes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredNotes.map((note) => (
                <div key={note.id} className="note-card-enter">
                  <NoteCard
                    note={note}
                    onDelete={handleDelete}
                    isDark={isDark}
                    isDeleting={deletingId === note.id}
                  />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── FAB: Create Note ── */}
        <button
          onClick={() => {
            if (!token.trim()) {
              setError("Please enter token first");
              return;
            }
            setShowOverlay(true);
          }}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg
            flex items-center justify-center text-2xl font-light
            transition-all duration-200 hover:scale-110 active:scale-95 z-40
            ${isDark
              ? "bg-neutral-100 text-neutral-900 hover:bg-white"
              : "bg-neutral-900 text-white hover:bg-neutral-700"
            }`}
        >
          +
        </button>
      </div>

      {/* ── Create Note Overlay ── */}
      <CreateOverlay
        show={showOverlay}
        onClose={() => setShowOverlay(false)}
        onSave={handleCreate}
        isDark={isDark}
      />
    </>
  );
}