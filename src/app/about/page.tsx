import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About now-trend.ing — Real-Time Trending Topic Search Engine",
  description:
    "Learn about now-trend.ing, a free tool to discover trending topics from Google Trends. Search any keyword and find related trending searches with real-time data.",
  alternates: {
    canonical: "https://now-trend.ing/about",
  },
  openGraph: {
    title: "About now-trend.ing — Real-Time Trending Topic Search Engine",
    description:
      "Learn about now-trend.ing, a free tool to discover trending topics from Google Trends.",
    url: "https://now-trend.ing/about",
  },
};

export default function AboutPage() {
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
            <Link
              href="/how-it-works"
              className="hover:text-zinc-200 transition-colors"
            >
              How It Works
            </Link>
            <Link href="/about" className="text-zinc-200">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
          About now-trend.ing
        </h1>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              What is now-trend.ing?
            </h2>
            <p>
              <strong className="text-zinc-100">now-trend.ing</strong> is a free
              real-time trending topic search engine that helps you discover
              what&apos;s trending right now. Powered by Google Trends data, it
              lets you search any keyword and instantly find related trending
              topics, complete with search volume data and trend breakdowns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Why Use now-trend.ing?
            </h2>
            <p className="mb-4">
              Unlike Google Trends itself, which requires you to know what
              you&apos;re looking for, now-trend.ing uses{" "}
              <strong className="text-zinc-100">semantic AI search</strong> to
              find trending topics related to any keyword you type. This means
              you can:
            </p>
            <ul className="list-none space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">●</span>
                <span>
                  <strong className="text-zinc-100">
                    Discover hidden trends
                  </strong>{" "}
                  — Find trending topics you didn&apos;t know were related to
                  your search
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">●</span>
                <span>
                  <strong className="text-zinc-100">
                    Get real-time data
                  </strong>{" "}
                  — Our database is updated multiple times daily with fresh Google
                  Trends data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">●</span>
                <span>
                  <strong className="text-zinc-100">
                    See the full picture
                  </strong>{" "}
                  — View search volumes, growth percentages, trend breakdowns, and
                  related topics at a glance
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">●</span>
                <span>
                  <strong className="text-zinc-100">
                    Search semantically
                  </strong>{" "}
                  — Our AI-powered embeddings understand meaning, not just
                  keywords, so you find relevant trends even with vague queries
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Who Is This For?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold text-zinc-100 mb-2">
                  📰 Content Creators
                </h3>
                <p className="text-sm text-zinc-400">
                  Find trending topics to write about, create videos on, or build
                  content around while they&apos;re still hot.
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold text-zinc-100 mb-2">
                  📊 Marketers & SEO Pros
                </h3>
                <p className="text-sm text-zinc-400">
                  Identify trending searches to optimize content strategy and
                  capitalize on rising search demand.
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold text-zinc-100 mb-2">
                  📈 Researchers
                </h3>
                <p className="text-sm text-zinc-400">
                  Track current trends across any topic area and understand what
                  people are searching for right now.
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold text-zinc-100 mb-2">
                  🌍 Curious Minds
                </h3>
                <p className="text-sm text-zinc-400">
                  Simply curious about what&apos;s trending? Explore any topic and
                  discover what the world is searching for.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Our Data
            </h2>
            <p>
              We scrape Google Trends data multiple times daily, indexing
              thousands of trending topics. Each topic is enriched with:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 text-zinc-400">
              <li>Search volume estimates</li>
              <li>Growth percentage (how fast it&apos;s rising)</li>
              <li>Related trend breakdowns</li>
              <li>Category classifications</li>
              <li>AI-generated semantic embeddings for intelligent search</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Completely Free
            </h2>
            <p>
              now-trend.ing is completely free to use with no account required.
              Just type a keyword and start discovering trends. No rate limits, no
              paywalls, no ads.
            </p>
          </section>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              ← Start Searching Trends
            </Link>
          </div>
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
