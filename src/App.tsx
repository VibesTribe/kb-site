import { useEffect, useState } from 'react';

type KBItem = {
  id: string;
  project: string;
  title: string;
  summary?: string;
  tags?: string[];
  date?: string;
  links?: string[];
};

export default function App() {
  const [items, setItems] = useState<KBItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          'https://vibestribe.github.io/knowledgebase/knowledge.json',
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to load knowledge.json:', err);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        🧠 VibesTribe Knowledgebase — LIVE DATA
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Loading knowledgebase…</p>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article key={item.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              {item.summary && (
                <p className="text-sm text-gray-700 mb-2">{item.summary}</p>
              )}
              <div className="text-xs text-gray-500 mb-1">
                📁 {item.project}
                {item.date ? <> • 🗓 {item.date}</> : null}
              </div>
              {item.tags && (
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
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
