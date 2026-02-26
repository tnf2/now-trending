import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trending Topics Today — What's Trending Right Now",
  description:
    "See the top trending topics and searches right now. Updated hourly with real-time Google Trends data showing what people are searching for today.",
  alternates: {
    canonical: "https://now-trend.ing/trending",
  },
  openGraph: {
    title: "Trending Topics Today — What's Trending Right Now",
    description:
      "See the top trending topics and searches right now. Updated hourly with real-time Google Trends data.",
    url: "https://now-trend.ing/trending",
  },
};

// Revalidate every 5 minutes so trending data stays fresh
export const revalidate = 300;

interface TrendingTopic {
  query: string;
  searchVolume: number;
  increasePercentage: number;
  categories: { id: number; name: string }[];
  trendBreakdown: string[];
  firstSeen: number;
  lastSeen: number;
  active: boolean;
  hoursAgo: number;
}

function formatVolume(vol: number): string {
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M+`;
  if (vol >= 1000) return `${Math.round(vol / 1000)}K+`;
  return `${vol}+`;
}

async function getTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const res = await fetch(`${baseUrl}/api/trending?limit=50`, {
      next: { revalidate: 300 },
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.trending || [];
  } catch {
    return [];
  }
}

export default async function TrendingPage() {
  const topics = await getTrendingTopics();
  const maxVolume = Math.max(...topics.map((t) => t.searchVolume), 1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">
              now-trend.ing
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-400">
            <Link href="/trending" className="text-zinc-200">
              Trending
            </Link>
            <Link
              href="/how-it-works"
              className="hover:text-zinc-200 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              className="hover:text-zinc-200 transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Trending Topics Today
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            The top trending searches right now, updated in real-time from
            Google Trends. See what the world is searching for today.
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-zinc-300 mb-2">
              Loading trending data...
            </h2>
            <p className="text-zinc-500">
              Trending topics are updated multiple times daily. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500 mb-6">
              Showing {topics.length} trending topics · Updated in real-time
            </p>

            <div className="space-y-3 pb-12">
              {topics.map((topic, i) => {
                const volumeWidth = Math.max(
                  5,
                  (topic.searchVolume / maxVolume) * 100
                );

                return (
                  <article
                    key={topic.query}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-zinc-600">
                            #{i + 1}
                          </span>
                          <h2 className="text-lg font-semibold text-zinc-100 truncate">
                            {topic.query}
                          </h2>
                          {topic.active && (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <span className="font-medium text-zinc-300">
                            {formatVolume(topic.searchVolume)} searches
                          </span>
                          {topic.increasePercentage > 0 && (
                            <span className="text-emerald-400">
                              ↑ {topic.increasePercentage.toLocaleString()}%
                            </span>
                          )}
                          {topic.hoursAgo < 1 && (
                            <span className="text-emerald-400">Just now</span>
                          )}
                          {topic.hoursAgo >= 1 && topic.hoursAgo < 24 && (
                            <span>{topic.hoursAgo}h ago</span>
                          )}
                        </div>
                      </div>
                      {topic.categories.length > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border text-blue-400 bg-blue-400/10 border-blue-400/20">
                          {topic.categories[0].name}
                        </span>
                      )}
                    </div>

                    {/* Volume bar */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${volumeWidth}%`,
                          background:
                            "linear-gradient(90deg, #10b981, #3b82f6)",
                        }}
                      />
                    </div>

                    {/* Trend breakdown */}
                    {topic.trendBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {topic.trendBreakdown.slice(0, 8).map((tag, j) => (
                          <span
                            key={j}
                            className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md border border-zinc-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
          >
            🔍 Search for specific trends
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <p>Data sourced from Google Trends · Updated multiple times daily</p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:text-zinc-400 transition-colors">
              About
            </Link>
            <Link
              href="/trending"
              className="hover:text-zinc-400 transition-colors"
            >
              Trending Now
            </Link>
            <Link
              href="/how-it-works"
              className="hover:text-zinc-400 transition-colors"
            >
              How It Works
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
