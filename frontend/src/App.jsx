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

const IconNote = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const MAX_CHARS = 500;

// ── NoteCard ───────────────────────────────────────────────────
function NoteCard({ note, onDelete, isDark, isDeleting }) {
  const [expanded, setExpanded] = useState(false);

  const dateStr = note.created
    ? new Date(note.created).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", year: "numeric",
      })
    : note.created?.slice(0, 10) ?? "";

  const timeStr = note.created
    ? new Date(note.created).toLocaleTimeString("th-TH", {
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const isLong = note.content.length > 120;
  const displayContent = expanded || !isLong
    ? note.content
    : note.content.slice(0, 120) + "...";

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300
        ${isDark
          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-600"
          : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
        }`}
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-2">
        <h3
          className={`font-medium text-sm leading-snug break-words flex-1 cursor-pointer
            ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          onClick={() => setExpanded(!expanded)}
        >
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

      {/* Content */}
      <div className="px-4 pb-3">
        <p
          className={`text-xs leading-relaxed whitespace-pre-wrap break-words cursor-pointer
            ${isDark ? "text-neutral-500" : "text-neutral-500"}`}
          onClick={() => setExpanded(!expanded)}
        >
          {displayContent}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-xs mt-1 font-medium transition-colors
              ${isDark ? "text-neutral-600 hover:text-neutral-400" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Timestamp */}
      <div className={`px-4 pb-3 flex items-center gap-1.5
        ${isDark ? "text-neutral-700" : "text-neutral-400"}`}>
        <span className="text-xs font-mono">{dateStr}</span>
        {timeStr && <span className="text-xs font-mono opacity-60">· {timeStr}</span>}
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [token, setToken] = useState("");
  const [source, setSource] = useState("local");
  const [search, setSearch] = useState("");

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Fetch notes
  const loadNotes = useCallback(async () => {
    setIsFetching(true);
    setError("");
    try {
      const data = await fetchNotes(token, source);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  }, [token, source]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Create note
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content.");
      return;
    }
    if (!token.trim()) {
      setError("Token is required.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const newNote = await createNote(token, source, title.trim(), content.trim());
      setNotes((prev) => [newNote, ...prev]);
      setTitle("");
      setContent("");
      setSuccessMsg("Saved!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete note
  async function handleDelete(id) {
    if (!token.trim()) { setError("Token is required."); return; }
    setDeletingId(id);
    setError("");
    try {
      await deleteNote(token, source, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Filter notes by search
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  // ── Theme vars ──
  const bg = isDark ? "bg-neutral-950" : "bg-neutral-50";
  const sidebarBg = isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200";
  const contentBg = isDark ? "bg-neutral-950" : "bg-neutral-50";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-500" : "text-neutral-500";
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-all duration-150 outline-none
    ${isDark
      ? "bg-neutral-800 border-neutral-700 text-neutral-100 placeholder-neutral-600 focus:border-neutral-500"
      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:bg-white"
    }`;

  return (
    <div className={`flex h-screen overflow-hidden ${bg} transition-colors duration-300`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col border-r transition-all duration-300 ${sidebarBg}
        ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}`}>

        {/* Sidebar Header */}
        <div className={`flex items-center justify-between px-4 py-4 border-b
          ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
              <IconNote />
            </div>
            <span className={`font-semibold text-sm ${textPrimary}`}>SecureNote</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 rounded-lg transition-colors
              ${isDark ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
        </div>

        {/* Config Section */}
        <div className={`px-4 py-4 border-b ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
          <div className="flex items-center gap-1.5 mb-3">
            <IconKey />
            <span className={`text-xs font-medium uppercase tracking-wider ${textSecondary}`}>
              Config
            </span>
          </div>

          {/* Source toggle */}
          <div className={`flex rounded-lg p-0.5 mb-3 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
            {["local", "pockethost"].map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                  ${source === s
                    ? isDark ? "bg-neutral-700 text-neutral-100" : "bg-white text-neutral-900 shadow-sm"
                    : textSecondary
                  }`}
              >
                {s === "local" ? "Local" : "PocketHost"}
              </button>
            ))}
          </div>

          {/* Token input */}
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={source === "local" ? "SECRET_TOKEN" : "PocketHost token"}
            className={inputClass}
          />
          <p className={`text-xs mt-1.5 ${textSecondary}`}>
            {source === "local" ? "Required for create & delete" : "Required for all operations"}
          </p>
        </div>

        {/* New Note Form */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-1.5 mb-3">
            <IconPlus />
            <span className={`text-xs font-medium uppercase tracking-wider ${textSecondary}`}>
              New Note
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className={inputClass}
              disabled={isSubmitting}
            />
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setContent(e.target.value);
                }}
                placeholder="Write your note..."
                rows={6}
                className={`${inputClass} resize-none`}
                disabled={isSubmitting}
              />
              {/* Character count */}
              <span className={`absolute bottom-2 right-2 text-xs font-mono
                ${content.length >= MAX_CHARS
                  ? "text-red-400"
                  : isDark ? "text-neutral-600" : "text-neutral-400"
                }`}>
                {content.length}/{MAX_CHARS}
              </span>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                ⚠ {error}
              </div>
            )}
            {successMsg && (
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-150
                flex items-center justify-center gap-2 active:scale-[0.98]
                ${isDark
                  ? "bg-neutral-100 text-neutral-900 hover:bg-white"
                  : "bg-neutral-900 text-white hover:bg-neutral-700"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? <><IconSpinner /><span>Saving...</span></> : "Save Note"}
            </button>
          </form>
        </div>

        {/* Sidebar Footer */}
        <div className={`px-4 py-3 border-t ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
          <p className={`text-xs font-mono ${textSecondary}`}>
            SecureNote · React + Node.js
          </p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={`flex-1 flex flex-col overflow-hidden ${contentBg}`}>

        {/* Top Bar */}
        <div className={`flex items-center gap-3 px-6 py-3 border-b
          ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors
              ${isDark
                ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Search */}
          <div className={`flex items-center gap-2 flex-1 max-w-sm px-3 py-1.5 rounded-lg border
            ${isDark
              ? "bg-neutral-900 border-neutral-800 text-neutral-400"
              : "bg-white border-neutral-200 text-neutral-400"
            }`}>
            <IconSearch />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className={`flex-1 text-sm bg-transparent outline-none
                ${isDark ? "text-neutral-100 placeholder-neutral-600" : "text-neutral-900 placeholder-neutral-400"}`}
            />
            {search && (
              <button onClick={() => setSearch("")} className={`${textSecondary} hover:text-red-400 text-xs`}>✕</button>
            )}
          </div>

          {/* Notes count + refresh */}
          <div className="flex items-center gap-2 ml-auto">
            <span className={`text-xs font-mono ${textSecondary}`}>
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
              {search && ` · "${search}"`}
            </span>
            <button
              onClick={loadNotes}
              disabled={isFetching}
              className={`p-1.5 rounded-lg transition-colors
                ${isDark
                  ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                } disabled:opacity-40`}
            >
              {isFetching
                ? <IconSpinner />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
              }
            </button>
          </div>
        </div>

        {/* Notes Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Loading skeleton */}
          {isFetching && notes.length === 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl border p-4 animate-pulse break-inside-avoid
                  ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"}`}>
                  <div className={`h-4 rounded mb-3 w-3/4 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`} />
                  <div className={`h-3 rounded mb-2 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`} />
                  <div className={`h-3 rounded w-2/3 ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isFetching && filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`text-5xl mb-4`}>
                {search ? "🔍" : "📝"}
              </div>
              <p className={`text-sm font-medium mb-1 ${textPrimary}`}>
                {search ? `No results for "${search}"` : "No notes yet"}
              </p>
              <p className={`text-xs ${textSecondary}`}>
                {search ? "Try a different keyword" : "Create your first note in the sidebar"}
              </p>
            </div>
          )}

          {/* Notes masonry grid */}
          {filteredNotes.length > 0 && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredNotes.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
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
        </div>
      </main>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}