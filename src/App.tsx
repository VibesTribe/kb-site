import { useEffect, useMemo, useState } from "react";

type KBItem = {
  id: string;
  project: string;
  title: string;
  summary?: string;
  tags?: string[];
  date?: string;
  links?: string[];
};

const KB_URL =
  "https://cdn.jsdelivr.net/gh/VibesTribe/knowledgebase@main/knowledge.json";

export default function App() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("All");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setErr(null);
        const res = await fetch(KB_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Handle both formats: array OR { bookmarks: [...] }
        const arr: KBItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data.bookmarks)
          ? data.bookmarks.map((b: any) => ({
              id: String(b.id),
              project: b.collection || "General",
              title: b.title,
              summary: b.summary || "",
              tags: b.tags || [],
              date: b.created ? b.created.slice(0, 10) : "",
              links: b.link ? [b.link] : [],
            }))
          : [];

        if (!canceled) setItems(arr);
      } catch (e: any) {
        if (!canceled) setErr(e?.message ?? "Failed to load knowledgebase");
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const projects = useMemo(
    () =>
      ["All", ...Array.from(new Set(items.map((i) => i.project)))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [items]
  );

  const filtered = useMemo(() => {
    let out = items;
    if (project !== "All") out = out.filter((i) => i.project === project);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.summary ?? "").toLowerCase().includes(q) ||
          (i.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return out
      .slice()
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [items, project, query]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            🧠 VibesTribe Knowledgebase —{" "}
            <span className="text-green-600">LIVE</span>
          </h1>
          <p className="text-sm text-gray-600">
            {err ? (
              <span className="text-red-600">Error: {err}</span>
            ) : (
              <>
                Loaded <b>{items.length}</b> items.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="rounded border px-3 py-1 text-sm bg-white"
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title/summary/tags…"
            className="rounded border px-3 py-1 text-sm bg-white w-56"
          />
        </div>
      </header>

      {!items.length && !err && <p className="text-gray-600">Loading…</p>}

      {!!filtered.length && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <article key={item.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              {item.summary && (
                <p className="text-sm text-gray-700 mb-2">{item.summary}</p>
              )}
              <div className="text-xs text-gray-500 mb-1"
