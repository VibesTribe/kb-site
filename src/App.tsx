import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Folder,
  Moon,
  RefreshCw,
  Sun
} from "lucide-react";

import { Card, CardContent } from "./components/ui/card";

type KBItem = {
  id: string | number;
  title: string;
  link?: string;
  summary?: string | null;
  tags?: string[];
  created?: string;
  collection?: string;
  enriched?: boolean;
};

const KB_URL =
  "https://cdn.jsdelivr.net/gh/VibesTribe/knowledgebase@main/knowledge.json";

const DARK_MODE_KEY = "kb-site:dark-mode";
const AUTO_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 12; // 12 hours

const COLLECTION_LABELS: Record<string, string> = {
  vibeflow: "Vibeflow",
  knowledgebase: "Knowledgebase",
  research: "Research"
};

function normalizeCollection(value?: string) {
  if (!value) return "Misc";
  const lower = value.toLowerCase();
  if (COLLECTION_LABELS[lower]) return COLLECTION_LABELS[lower];
  if (/^\d+$/.test(value)) return `Collection ${value}`;
  return value
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function getTags(items: KBItem[]) {
  const tagSet = new Set<string>();
  items.forEach((item) => {
    (item.tags ?? []).forEach((tag) => {
      const trimmed = tag.trim();
      if (trimmed) tagSet.add(trimmed);
    });
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

function getCollections(items: KBItem[]) {
  const colSet = new Set<string>();
  items.forEach((item) => {
    colSet.add(normalizeCollection(item.collection));
  });
  const list = Array.from(colSet).sort((a, b) => a.localeCompare(b));
  return ["All", ...list];
}

export default function App() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored != null) setDarkMode(stored === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(darkMode));
  }, [darkMode]);

  const handleRefresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(KB_URL, {
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const collection = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookmarks)
          ? data.bookmarks
          : [];
        const cleaned: KBItem[] = collection
          .filter((entry: KBItem) => entry?.title && entry?.link)
          .map((entry: KBItem) => ({
            ...entry,
            tags: Array.isArray(entry.tags)
              ? entry.tags.filter((tag) => typeof tag === "string" && tag.trim())
              : []
          }));
        if (!canceled) {
          setItems(cleaned);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        if (controller.signal.aborted || canceled) return;
        if (!canceled) setError(err?.message ?? "Failed to load knowledgebase");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [reloadToken]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [handleRefresh]);

  const availableTags = useMemo(() => getTags(items), [items]);
  const availableCollections = useMemo(() => getCollections(items), [items]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCollection !== "All") {
      result = result.filter(
        (item) => normalizeCollection(item.collection) === selectedCollection
      );
    }

    if (selectedTag) {
      result = result.filter((item) =>
        (item.tags ?? []).some((tag) => tag === selectedTag)
      );
    }

    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery) {
      result = result.filter((item) => {
        const haystacks = [
          item.title,
          item.summary ?? "",
          normalizeCollection(item.collection),
          ...(item.tags ?? [])
        ];
        return haystacks.some((value) =>
          value?.toLowerCase().includes(trimmedQuery)
        );
      });
    }

    return result
      .slice()
      .sort((a, b) => (b.created ?? "").localeCompare(a.created ?? ""));
  }, [items, query, selectedCollection, selectedTag]);

  const pageClasses = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 transition-colors duration-500"
    : "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 transition-colors duration-500";

  const inputClasses = darkMode
    ? "rounded-full border border-gray-600 bg-gray-900/70 px-4 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
    : "rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200";

  const toggleClasses = darkMode
    ? "flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/70 bg-gray-900/70 text-cyan-300 transition hover:scale-110"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:scale-110";

  const refreshClasses = darkMode
    ? "flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gray-900/70 text-gray-300 transition hover:scale-105 disabled:opacity-70"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:scale-105 disabled:opacity-70";

  const statusClasses = darkMode
    ? "text-sm md:text-base text-gray-300"
    : "text-sm md:text-base text-gray-600";

  const timestampClasses = darkMode
    ? "mt-1 block text-xs text-cyan-200 md:ml-2 md:inline md:mt-0"
    : "mt-1 block text-xs text-gray-500 md:ml-2 md:inline md:mt-0";

  const refreshIconClasses = loading ? "h-4 w-4 animate-spin" : "h-4 w-4";

  return (
    <div className={`${pageClasses} p-6 md:p-10`}>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 md:text-2xl">
            VibesTribe Knowledgebase
          </h1>
          <p className={statusClasses}>
            {error ? (
              <span className="text-red-500">Error: {error}</span>
            ) : loading ? (
              "Loading bookmarks..."
            ) : (
              <>
                Loaded <b>{items.length}</b> bookmarks.
                {lastUpdated && (
                  <span className={timestampClasses}>
                    Updated {lastUpdated.toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search bookmarks"
            className={inputClasses}
            aria-label="Search bookmarks"
          />
          <button
            type="button"
            onClick={handleRefresh}
            className={refreshClasses}
            aria-label="Refresh bookmarks"
            title="Refresh bookmarks"
            disabled={loading}
          >
            <RefreshCw className={refreshIconClasses} />
          </button>
          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            className={toggleClasses}
            aria-label="Toggle dark mode"
            aria-pressed={darkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {availableCollections.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {availableCollections.map((collection) => {
            const isActive = selectedCollection === collection;
            const baseClasses =
              "px-3 py-1 text-xs md:text-sm rounded-full border transition transform hover:-translate-y-0.5";
            const activeClasses = darkMode
              ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
              : "border-blue-400 bg-blue-100 text-blue-700 shadow-sm";
            const inactiveClasses = darkMode
              ? "border-gray-700 bg-gray-900/60 text-gray-300 hover:border-cyan-300 hover:text-cyan-200"
              : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600";
            return (
              <button
                key={collection}
                type="button"
                onClick={() => setSelectedCollection(collection)}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                {collection}
              </button>
            );
          })}
        </div>
      )}

      {availableTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isActive = selectedTag === tag;
            const baseClasses =
              "px-2 py-0.5 text-xs rounded-full border transition transform hover:scale-105";
            const activeClasses = darkMode
              ? "border-green-400 bg-green-500/30 text-green-100"
              : "border-blue-400 bg-blue-100 text-blue-700";
            const inactiveClasses = darkMode
              ? "border-gray-700 bg-gray-900/60 text-gray-300 hover:border-green-300 hover:text-green-200"
              : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600";
            return (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setSelectedTag((current) => (current === tag ? null : tag))
                }
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                #{tag}
              </button>
            );
          })}
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={
                darkMode
                  ? "px-2 py-0.5 text-xs rounded-full border border-red-400 text-red-200 hover:bg-red-500/10"
                  : "px-2 py-0.5 text-xs rounded-full border border-red-300 text-red-500 hover:bg-red-100"
              }
            >
              Clear tag
            </button>
          )}
        </div>
      )}

      {loading && (
        <div
          className={
            darkMode
              ? "text-sm text-gray-400 animate-pulse-slow"
              : "text-sm text-gray-500 animate-pulse-slow"
          }
        >
          Syncing fresh knowledge...
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-sm text-gray-500">
          No bookmarks match the current filters.
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredItems.map((item) => {
          const displayCollection = normalizeCollection(item.collection);
          const created = formatDate(item.created);
          const hasTags = (item.tags ?? []).length > 0;
          const cardClasses = darkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 shadow-[0_0_10px_rgba(34,211,238,0.35)] hover:shadow-[0_0_18px_rgba(74,222,128,0.8)] hover:-translate-y-1"
            : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200 shadow-md hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1";
          const titleClasses = darkMode
            ? "font-semibold text-base mb-2 line-clamp-2 text-gray-100 hover:text-green-300 transition-colors duration-200"
            : "font-semibold text-base mb-2 line-clamp-2 text-gray-900 hover:text-blue-700 transition-colors duration-200";
          const summaryClasses = darkMode
            ? "text-sm mb-3 line-clamp-3 text-gray-300"
            : "text-sm mb-3 line-clamp-3 text-gray-700";
          const metaClasses = darkMode
            ? "text-xs mb-3 text-gray-400"
            : "text-xs mb-3 text-gray-500";
          const linkClasses = darkMode
            ? "inline-flex items-center justify-center gap-1 rounded-md border border-gray-500 bg-blue-800 px-3 py-1 text-xs font-bold text-white transition duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
            : "inline-flex items-center justify-center gap-1 rounded-md border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 transition duration-200 hover:scale-105 hover:bg-blue-200 hover:shadow-md";

          return (
            <Card key={item.id} className={`${cardClasses} transition-all duration-300`}>
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div>
                  <h2 className={titleClasses}>{item.title}</h2>
                  {item.summary && <p className={summaryClasses}>{item.summary}</p>}
                </div>
                <div className={`${metaClasses} flex flex-wrap items-center gap-3`}>
                  <span className="inline-flex items-center gap-1">
                    <Folder className="h-4 w-4" aria-hidden="true" />
                    {displayCollection}
                  </span>
                  {created && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      {created}
                    </span>
                  )}
                </div>
                {hasTags && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags!.map((tag) => {
                      const isActive = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setSelectedTag((current) =>
                              current === tag ? null : tag
                            )
                          }
                          className={
                            darkMode
                              ? `px-2 py-0.5 rounded-full text-xs border ${
                                  isActive
                                    ? "border-green-400 bg-green-500/30 text-green-100"
                                    : "border-gray-600 bg-gray-900/60 text-gray-300 hover:border-green-300 hover:text-green-200"
                                }`
                              : `px-2 py-0.5 rounded-full text-xs border ${
                                  isActive
                                    ? "border-blue-400 bg-blue-100 text-blue-800"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                }`
                          }
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClasses}
                  >
                    <span>View Source</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
