import { useEffect, useMemo, useState } from 'react';

type KBItem = {
  id: string;
  project: string;
  title: string;
  summary?: string;
  tags?: string[];
  date?: string;
  links?: string[];
};

const KB_URL = 'https://cdn.jsdelivr.net/gh/VibesTribe/knowledgebase@main/knowledge.json';

export default function App() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [query, setQuery] = useState('');
  const [project, setProject] = useState('All');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(KB_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr: KBItem[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        if (!canceled) {
          setItems(arr);
          setErr(null);
        }
      } catch (e: any) {
        if (!canceled) setErr(e?.message ?? 'Failed to load knowledgebase');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  const projects = useMemo(
    () => ['All', ...Array.from(new Set(items.map(i => i.project)))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    let out = items;
    if (project !== 'All') out = out.filter(i => i.project === project);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.summary ?? '').toLowerCase().includes(q) ||
        (i.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }
    return out.slice().sort((a,b)=>(b.date ?? '').localeCompare(a.date ?? ''));
  }, [items, project, query]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            🧠 VibesTribe Knowledgebase — LIVE DATA
          </h1>
          {loading && <p className="text-sm text-gray-600">Loading knowledgebase…</p>}
          {err && <p className="text-sm text-red-600">Error: {err}</p>}
          {!loading && !err && <p className="text-sm text-gray-600">Loaded <b>{items.length}</b> items.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={project}
            onChange={e => setProject(e.target.value)}
            className="rounded border px-3 py-1 text-sm bg-white"
          >
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title/summary/tags…"
            className="rounded border px-3 py-1 text-sm bg-white w-56"
          />
        </div>
      </header>

      {!!filtered.length && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <article key={item.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              {item.summary && <p className="text-sm text-gray-700 mb-2">{item.summary}</p>}
              <div className="text-xs text-gray-500 mb-1">
                📁 {item.project}{item.date ? <> • 🗓 {item.date}</> : null}
              </div>
              {!!(item.tags?.length) && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {item.tags!.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">#{tag}</span>
                  ))}
                </div>
              )}
              {item.links?.[0] && (
                <a href={item.links[0]} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">
                  View Source ↗
                </a>
              )}
            </article>
          ))}
        </section>
      )}

      {!loading && !err && items.length > 0 && filtered.length === 0 && (
        <p className="text-gray-600">No matches for your filters.</p>
      )}
    </main>
  );
}
