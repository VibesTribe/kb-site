import { useState } from 'react';

// Temporary fallback while learning
const knowledgeData = [
  {
    id: 'vf_loop_guard_001',
    project: 'Vibeflow',
    type: 'lesson',
    title: 'Agent Loop Prevention',
    summary: 'Prevents recursive agent task failures in GitHub trigger chains.',
    tags: ['agent', 'loop', 'safety'],
    date: '2025-09-17',
    links: [
      'https://github.com/VibesTribe/knowledgebase/blob/main/agents/loop-guard.md'
    ]
  }
];

export default function App() {
  const [projectFilter, setProjectFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'card' | 'graph'>('card');

  const projects = [
    'All',
    ...Array.from(new Set(knowledgeData.map((item) => item.project)))
  ];

  const filtered = knowledgeData.filter(
    (item) => projectFilter === 'All' || item.project === projectFilter
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🧠 VibesTribe Knowledgebase</h1>
        <div className="space-x-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded border px-3 py-1 text-sm"
          >
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded border text-sm"
            onClick={() =>
              setViewMode(viewMode === 'card' ? 'graph' : 'card')
            }
          >
            Toggle View: {viewMode}
          </button>
        </div>
      </header>

      {viewMode === 'card' ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
              <p className="text-sm text-gray-700 mb-2">{item.summary}</p>
              <div className="text-xs text-gray-500 mb-1">
                📁 {item.project} • 🗓 {item.date}
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              {item.links?.length > 0 && (
                <a
                  href={item.links[0]}
                  target="_blank"
                  className="text-blue-500 mt-2 block text-sm underline"
                  rel="noreferrer"
                >
                  View Source ↗
                </a>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section>
          <p className="text-center text-gray-600">[Graph view coming soon]</p>
        </section>
      )}
    </main>
  );
}
