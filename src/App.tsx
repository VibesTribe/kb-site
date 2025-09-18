import { useEffect, useMemo, useState } from 'react';

// --- Types ---
type KBItem = {
  id: string;
  project: string;
  type?: string;
  title: string;
  summary?: string;
  tags?: string[];
  date?: string; // YYYY-MM-DD
  links?: string[];
};

// --- Config ---
// Primary source: knowledge.json in your VibesTribe/knowledgebase repo
const REMOTE_KB_URL =
  'https://raw.githubusercontent.com/VibesTribe/knowledgebase/main/knowledge.json';

// Local fallback: keeps the UI working even if remote fetch fails
const LOCAL_FALLBACK: KBItem[] = [
  {
    id: 'vf_loop_guard_001',
    project: 'Vibeflow',
    type: 'lesson',
    title: 'Agent Loop Prevention',
    summary:
      'Prevents recursive agent task failures in agent pipelines. (Local fallback)',
    tags: ['agent', 'loop', 'safety'],
    date: '2025-09-17',
    links: [
      'https://github.com/VibesTribe/knowledgebase/blob/main/agents/loop-guard.md',
    ],
  },
];

// --- Helpers ---
function normalize(items: any[]): KBItem[] {
  return (items || []).map((x, i) => ({
    id: String(x.id ?? `item_${i}`),
    project: String(x.project ?? 'General'),
    type: x.type ?? undefined,
    title: String(x.title ?? 'Untitled'),
    summary: x.summary ?? undefined,
    tags: Array.isArray(x.tags) ? x.tags : [],
    date: x.date ?? undefined,
    links: Array.isArray(x.links) ? x.links : x.url ? [x.url] : [],
  }));
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function App() {
  const [items, setItems] = useState<KBItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'graph'>('card');
  const [projectFilter, setProjectFilter] = useState<string>('All');
  const [query, setQuery] = useState('');

  // Fetch remote knowledge.json
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch(REMOTE_KB_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = normalize(
          Array.isArray(data) ? data : data.items ?? []
        );
        if (!cancelled && normalized.length) {
          setItems(normalized);
          localStorage.setItem('kb_cache', JSON.stringify(normalized));
          return;
        }
        if (!cancelled) setItems(LOCAL_FALLBACK);
      } catch (e: any) {
        console.warn('KB fetch failed, using cache/fallback:', e);
        const cached = localStorage.getItem('kb_cache');
        if (!cancelled && cached) {
          try {
            setItems(JSON.parse(cached));
            return;
          } catch {}
        }
        if (!cancelled) {
          setItems(LOCAL_FALLBACK);
          setError('Online data unavailable — showing fallback data.');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const projects = useMemo(() => {
    const list = unique(['All', ...(items?.map((i) => i.project) ?? [])]);
    return list.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    let arr = items ?? [];
    if (projectFilter !== 'All') {
      arr = arr.filter((i) => i.project === projectFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.summary ?? '').toLowerCase().includes(q) ||
          (i.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return arr.slice().sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }, [items, projectFilter, query]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">🧠 VibesTribe Knowledgebase</h1>
          <p className="text-sm text-gray-600">
            Live data from knowledge.json (auto-updating).{' '}
            {error && <span className="text-red-600">{error}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
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
            placeholder="Search title, summary, tags…"
            className="rounded border px-3 py-1 text-sm bg-white w-56"
          />
          <button
            className="px-3 py-1 rounded border text-sm bg-white"
            onClick={() => setViewMode(viewMode === 'card' ? 'graph' : 'card')}
          >
            Toggle View: {viewMode}
          </button>
        </div>
      </header>

      {!items && <p className="text-gray-600">Loading knowledgebase…</p>}

      {items && viewMode === 'card' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <article key={item.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              {item.summary && (
                <p className="text-sm text-gray-700 mb-2">{item.summary}</p>
              )}
              <div className="text-xs text-gray-500 mb-1">
                📁 {item.project}
                {item.date ? <> • 🗓 {item.date}</> : null}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {item.links?.[0] && (
                <a
                  href={item.links[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Source ↗
                </a>
              )}
            </article>
          ))}
        </section>
      )}

      {items && viewMode === 'graph' && (
        <section className="bg-white shadow rounded p-4">
          <p className="text-gray-700">
            Graph view coming soon. Use Card view for now.
          </p>
        </section>
      )}
    </main>
  );
}
