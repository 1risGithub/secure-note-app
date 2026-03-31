import { useState, useEffect, useCallback } from "react";
import { fetchNotes, createNote, deleteNote } from "./api";

// ── Icons ──────────────────────────────────────────────
const IconSpinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

// ── NoteCard ───────────────────────────────────────────
function NoteCard({ note, onDelete, isDark, isDeleting }) {
  const dateStr = note.created
    ? new Date(note.created).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "";

  return (
    <div className={`group relative rounded-2xl border p-5 transition-all duration-300 animate-slide-up
      ${isDark
        ? "bg-slate-800 border-slate-700 hover:border-amber-500/50"
        : "bg-white border-slate-200 hover:border-amber-400/60 hover:shadow-lg"
      }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={`font-display font-semibold text-lg leading-tight break-words flex-1
          ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {note.title}
        </h3>
        <button
          onClick={() => onDelete(note.id)}
          disabled={isDeleting}
          className={`flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200
            ${isDark
              ? "text-slate-500 hover:text-red-400 hover:bg-red-900/20"
              : "text-slate-400 hover:text-red-500 hover:bg-red-50"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          {isDeleting ? <IconSpinner /> : <IconTrash />}
        </button>
      </div>
      <p className={`text-sm leading-relaxed break-words whitespace-pre-wrap mb-4
        ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {note.content}
      </p>
      {dateStr && (
        <p className={`text-xs font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {dateStr}
        </p>
      )}
    </div>
  );
}

// ── App ────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [token, setToken] = useState("");
  const [source, setSource] = useState("local");

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDark, setIsDark] = useState(false);

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
      setError("A token is required to create notes.");
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
      setSuccessMsg("Note saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete note
  async function handleDelete(id) {
    if (!token.trim()) {
      setError("A token is required to delete notes.");
      return;
    }
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

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none
    ${isDark
      ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-amber-500"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white"
    }`;

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>

      {/* Header */}
      <header className={`sticky top-0 z-10 border-b backdrop-blur-sm
        ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50/90 border-slate-200"}`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className={`font-display font-bold text-xl ${textPrimary}`}>SecureNote</h1>
            <p className={`text-xs ${textSecondary}`}>Full-Stack · Node.js + React</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Source Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs font-mono
              ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
              {["local", "pockethost"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSource(s)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200
                    ${source === s
                      ? "bg-amber-500 text-white font-medium"
                      : `${textSecondary} hover:text-amber-500`
                    }`}
                >
                  {s === "local" ? "Local" : "PocketHost"}
                </button>
              ))}
            </div>
            {/* Dark mode */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-all duration-200
                ${isDark
                  ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400"
                  : "bg-white border-slate-200 text-slate-500 hover:text-amber-500"
                }`}
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Token Input */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <h2 className={`text-sm font-semibold font-mono uppercase tracking-widest mb-4 ${textSecondary}`}>
            Configuration
          </h2>
          <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>
            {source === "local" ? "SECRET_TOKEN" : "POCKETHOST TOKEN"}
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={source === "local" ? "Enter your SECRET_TOKEN" : "Enter PocketHost token"}
            className={inputClass}
          />
          <p className={`text-xs mt-1.5 ${textSecondary}`}>
            {source === "local"
              ? "Required for Create & Delete. GET is public."
              : "Required for all operations in PocketHost mode."}
          </p>
        </section>

        {/* Create Note Form */}
        <section className={`rounded-2xl border p-6 ${cardBg}`}>
          <h2 className={`font-display font-semibold text-lg mb-5 ${textPrimary}`}>New Note</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className={inputClass}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${textSecondary}`}>CONTENT</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={5}
                className={`${inputClass} resize-none`}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm animate-fade-in">
                ⚠ {error}
              </div>
            )}
            {successMsg && (
              <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-500 text-sm animate-fade-in">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold
                text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? <><IconSpinner /><span>Saving...</span></> : "Save Note"}
            </button>
          </form>
        </section>

        {/* Notes List */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`font-display font-semibold text-lg ${textPrimary}`}>
              Notes
              {notes.length > 0 && (
                <span className={`ml-2 text-sm font-sans font-normal ${textSecondary}`}>
                  ({notes.length})
                </span>
              )}
            </h2>
            <button
              onClick={loadNotes}
              disabled={isFetching}
              className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all duration-200
                flex items-center gap-1.5
                ${isDark
                  ? "border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-400"
                  : "border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-600"
                } disabled:opacity-40`}
            >
              {isFetching ? <IconSpinner /> : "↻"}
              {isFetching ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Loading skeleton */}
          {isFetching && notes.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`rounded-2xl border p-5 animate-pulse
                  ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                  <div className={`h-5 rounded-lg mb-3 w-3/4 ${isDark ? "bg-slate-700" : "bg-slate-100"}`} />
                  <div className={`h-3 rounded mb-2 ${isDark ? "bg-slate-700" : "bg-slate-100"}`} />
                  <div className={`h-3 rounded w-2/3 ${isDark ? "bg-slate-700" : "bg-slate-100"}`} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isFetching && notes.length === 0 && (
            <div className={`text-center py-20 rounded-2xl border
              ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <p className="text-4xl mb-3">📝</p>
              <p className={`text-sm ${textSecondary}`}>No notes yet. Create your first one above.</p>
            </div>
          )}

          {/* Notes grid */}
          {notes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                  isDark={isDark}
                  isDeleting={deletingId === note.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 py-6 text-center ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <p className={`text-xs font-mono ${textSecondary}`}>
          SecureNote · Full-Stack · React + Node.js · 2025
        </p>
      </footer>
    </div>
  );
}