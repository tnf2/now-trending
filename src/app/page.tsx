import { Suspense } from "react";
import HomeClient from "./home-client";
import Link from "next/link";

// Server-side: fetch some trending topics for crawlers to index
async function getInitialTrending() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const res = await fetch(`${baseUrl}/api/trending?limit=20`, {
      next: { revalidate: 300 },
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.trending || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const initialTrending = await getInitialTrending();

  return (
    <>
      <Suspense fallback={null}>
        <HomeClient />
      </Suspense>

      {/* SEO-only content: visible to crawlers, hidden from interactive users */}
      {/* This noscript + hidden section ensures Google indexes trending content */}
      <div className="sr-only" aria-hidden="true">
        <section>
          <h2>Currently Trending Topics</h2>
          <p>
            Discover what&apos;s trending right now. now-trend.ing tracks thousands
            of trending topics from Google Trends, updated multiple times daily.
            Search any keyword to find related trending searches with real-time
            data including search volume, growth percentages, and trend
            breakdowns.
          </p>
          {initialTrending.length > 0 && (
            <ul>
              {initialTrending.map(
                (topic: {
                  query: string;
                  searchVolume: number;
                  increasePercentage: number;
                  active: boolean;
                }) => (
                  <li key={topic.query}>
                    {topic.query} — {topic.searchVolume.toLocaleString()}{" "}
                    searches
                    {topic.increasePercentage > 0 &&
                      ` (↑ ${topic.increasePercentage}%)`}
                    {topic.active && " (Active)"}
                  </li>
                )
              )}
            </ul>
          )}
        </section>

        <section>
          <h2>Popular Search Categories</h2>
          <p>
            Search for trending topics in any category including technology, AI,
            crypto, sports, entertainment, politics, stocks, and more. Our
            AI-powered semantic search finds related trends even when they
            don&apos;t share exact keywords.
          </p>
        </section>

        <nav>
          <h2>Explore now-trend.ing</h2>
          <ul>
            <li>
              <Link href="/trending">Trending Topics Today</Link> — See what&apos;s
              trending right now
            </li>
            <li>
              <Link href="/about">About now-trend.ing</Link> — Learn about our
              real-time trend search engine
            </li>
            <li>
              <Link href="/how-it-works">How It Works</Link> — Our AI-powered
              semantic search technology explained
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
