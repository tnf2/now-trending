"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

interface TrendResult {
  query: string;
  similarity: number;
  searchVolume: number;
  increasePercentage: number;
  categories: { id: number; name: string }[];
  trendBreakdown: string[];
  firstSeen: number;
  lastSeen: number;
  active: boolean;
  daysAgo: number;
}

interface SearchResponse {
  query: string;
  results: TrendResult[];
  count: number;
  timestamp: number;
}

interface Stats {
  totalTopics: number;
  totalScrapes: number;
  topicsWithEmbeddings: number;
  lastScrape: string | null;
}

const API_BASE = "";

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M+`;
  if (vol >= 1000) return `${Math.round(vol / 1000)}K+`;
  return `${vol}+`;
}

function formatTimeAgo(timestamp: number): string {
  const hours = Math.round((Date.now() - timestamp) / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function RelevanceBadge({ similarity }: { similarity: number }) {
  const pct = Math.round(similarity * 100);
  const color =
    pct >= 60
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : pct >= 40
      ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
      : "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}
    >
      {pct}% match
    </span>
  );
}

function ResultCard({
  result,
  index,
  maxVolume,
}: {
  result: TrendResult;
  index: number;
  maxVolume: number;
}) {
  const volumeWidth = Math.max(5, (result.searchVolume / maxVolume) * 100);

  return (
    <div
      className="result-card fade-in bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-zinc-100 truncate">
              {result.query}
            </h3>
            {result.active && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">
              {formatVolume(result.searchVolume)} searches
            </span>
            {result.increasePercentage > 0 && (
              <span className="text-emerald-400">
                ↑ {result.increasePercentage.toLocaleString()}%
              </span>
            )}
            <span>First seen {formatTimeAgo(result.firstSeen)}</span>
          </div>
        </div>
        <RelevanceBadge similarity={result.similarity} />
      </div>

      {/* Volume bar */}
      <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 overflow-hidden">
        <div className="volume-bar" style={{ width: `${volumeWidth}%` }} />
      </div>

      {/* Trend breakdown */}
      {result.trendBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.trendBreakdown.map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md border border-zinc-700/50 hover:text-zinc-200 hover:border-zinc-600 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="skeleton h-6 w-48 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-1 w-full mb-3 rounded-full" />
      <div className="flex gap-1.5">
        <div className="skeleton h-6 w-20 rounded-md" />
        <div className="skeleton h-6 w-24 rounded-md" />
        <div className="skeleton h-6 w-16 rounded-md" />
      </div>
    </div>
  );
}

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrendResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults(null);
        setSearched(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSearched(true);

      try {
        const resp = await fetch(
          `${API_BASE}/api/search?q=${encodeURIComponent(q)}&limit=20&min_sim=0.25`
        );
        if (!resp.ok) throw new Error("Search failed");
        const data: SearchResponse = await resp.json();
        setResults(data.results);
      } catch {
        setError("Failed to search. Please try again.");
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(query);
  };

  const maxVolume = results
    ? Math.max(...results.map((r) => r.searchVolume), 1)
    : 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">
              now-trend.ing
            </span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
              <Link href="/trending" className="hover:text-zinc-200 transition-colors">
                Trending
              </Link>
              <Link href="/how-it-works" className="hover:text-zinc-200 transition-colors">
                How It Works
              </Link>
              <Link href="/about" className="hover:text-zinc-200 transition-colors">
                About
              </Link>
            </nav>
            {stats && (
              <div className="text-xs text-zinc-500">
                {stats.totalTopics.toLocaleString()} trends tracked
                {stats.lastScrape && (
                  <> · Updated {formatTimeAgo(new Date(stats.lastScrape).getTime())}</>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto px-4 w-full">
        {/* Hero section */}
        <div className={`transition-all duration-500 ${searched ? "pt-8" : "pt-32"}`}>
          {!searched && (
            <div className="text-center mb-8 fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
                What&apos;s trending?
              </h1>
              <p className="text-lg text-zinc-400 max-w-lg mx-auto">
                Type any keyword and discover related topics that are trending
                right now on Google.
              </p>
            </div>
          )}

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="search-glow rounded-2xl bg-zinc-900 border border-zinc-700/50 flex items-center px-5 py-4">
              <svg
                className="w-5 h-5 text-zinc-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Search any topic... (e.g., candy, AI, basketball)"
                className="flex-1 bg-transparent text-lg text-zinc-100 placeholder-zinc-500 outline-none"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults(null);
                    setSearched(false);
                    inputRef.current?.focus();
                  }}
                  className="text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && results && results.length > 0 && (
          <div>
            <p className="text-sm text-zinc-500 mb-4">
              Found {results.length} related trending topic{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>
            <div className="space-y-3 pb-12">
              {results.map((result, i) => (
                <ResultCard
                  key={result.query}
                  result={result}
                  index={i}
                  maxVolume={maxVolume}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && searched && results && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">
              No trending topics found
            </h3>
            <p className="text-zinc-500">
              No currently trending topics match &quot;{query}&quot;. Try a broader search
              term.
            </p>
          </div>
        )}

        {/* Trending suggestions when no search */}
        {!searched && !loading && (
          <div className="text-center fade-in">
            <p className="text-sm text-zinc-500 mb-4">
              Try searching for:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "basketball",
                "crypto",
                "technology",
                "soccer",
                "politics",
                "entertainment",
                "AI",
                "stocks",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    search(suggestion);
                  }}
                  className="px-4 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <p>
            Data sourced from Google Trends · Updated twice daily ·{" "}
            {stats?.totalTopics.toLocaleString() || "..."} topics indexed
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:text-zinc-400 transition-colors">
              About
            </Link>
            <Link href="/trending" className="hover:text-zinc-400 transition-colors">
              Trending Now
            </Link>
            <Link href="/how-it-works" className="hover:text-zinc-400 transition-colors">
              How It Works
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
