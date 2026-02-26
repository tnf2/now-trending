import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — Semantic Trending Topic Search",
  description:
    "Learn how now-trend.ing uses AI-powered semantic search and Google Trends data to help you discover trending topics. Our technology explained.",
  alternates: {
    canonical: "https://now-trend.ing/how-it-works",
  },
  openGraph: {
    title: "How It Works — Semantic Trending Topic Search",
    description:
      "Learn how now-trend.ing uses AI-powered semantic search and Google Trends data to discover trending topics.",
    url: "https://now-trend.ing/how-it-works",
  },
};

export default function HowItWorksPage() {
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
            <Link
              href="/trending"
              className="hover:text-zinc-200 transition-colors"
            >
              Trending
            </Link>
            <Link href="/how-it-works" className="text-zinc-200">
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
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
          How It Works
        </h1>
        <p className="text-lg text-zinc-400 mb-12 max-w-2xl">
          now-trend.ing combines Google Trends data with AI-powered semantic
          search to help you discover trending topics in a way that wasn&apos;t
          possible before.
        </p>

        <div className="space-y-12">
          {/* Step 1 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
              1
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              We Collect Trending Data
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Multiple times every day, our system scrapes{" "}
              <strong className="text-zinc-100">Google Trends</strong> to collect
              the latest trending searches. We capture thousands of trending
              topics including:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <span className="text-zinc-100 font-medium">
                  Search Volume
                </span>
                <p className="text-sm text-zinc-500 mt-1">
                  How many people are searching for this topic
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <span className="text-zinc-100 font-medium">
                  Growth Rate
                </span>
                <p className="text-sm text-zinc-500 mt-1">
                  The percentage increase in search interest
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <span className="text-zinc-100 font-medium">
                  Related Topics
                </span>
                <p className="text-sm text-zinc-500 mt-1">
                  Breakdown of related trending queries
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <span className="text-zinc-100 font-medium">Categories</span>
                <p className="text-sm text-zinc-500 mt-1">
                  Topic categories like Sports, Tech, Entertainment
                </p>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
              2
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              AI Creates Semantic Embeddings
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Each trending topic is processed through{" "}
              <strong className="text-zinc-100">
                OpenAI&apos;s embedding model
              </strong>{" "}
              to create a mathematical representation of its meaning. This is
              what makes our search so powerful — instead of matching exact
              keywords, we understand the{" "}
              <em className="text-zinc-200">meaning</em> behind your search.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-400 mb-2">
                <span className="text-zinc-200 font-mono">Example:</span>{" "}
                Searching for &quot;basketball&quot; might match:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  "NBA Finals",
                  "Lakers vs Celtics",
                  "March Madness bracket",
                  "Steph Curry stats",
                  "basketball shoes",
                  "WNBA schedule",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md border border-zinc-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                None of these contain the word &quot;basketball&quot; — but our
                AI understands they&apos;re semantically related.
              </p>
            </div>
          </section>

          {/* Step 3 */}
          <section className="relative pl-12">
            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
              3
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              You Search, We Match
            </h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              When you type a search query, it gets embedded in real-time and
              compared against all trending topics using{" "}
              <strong className="text-zinc-100">cosine similarity</strong>. The
              most semantically relevant trending topics are returned instantly,
              ranked by relevance.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              The result? You get a curated list of trending topics that are
              actually related to what you&apos;re looking for — even if they
              don&apos;t share any keywords with your search.
            </p>
          </section>

          {/* Tech Stack */}
          <section className="mt-16 pt-8 border-t border-zinc-800/50">
            <h2 className="text-2xl font-semibold text-zinc-100 mb-6">
              Technology Stack
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-zinc-100 mb-1">Next.js</h3>
                <p className="text-xs text-zinc-500">
                  Server-rendered React for fast page loads
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-semibold text-zinc-100 mb-1">
                  OpenAI Embeddings
                </h3>
                <p className="text-xs text-zinc-500">
                  text-embedding-3-small for semantic understanding
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-zinc-100 mb-1">
                  Google Trends
                </h3>
                <p className="text-xs text-zinc-500">
                  Real-time trending data refreshed daily
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="pt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
          >
            ← Try It Now
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
