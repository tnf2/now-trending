import { NextRequest, NextResponse } from "next/server";
import { addTopics } from "@/lib/db";
import { generateEmbeddings } from "@/lib/embeddings";
import { randomUUID } from "crypto";

// Protect the scrape endpoint with a secret
const CRON_SECRET = process.env.CRON_SECRET || "dev-secret";

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ScrapedTopic {
  query: string;
  searchVolume: number;
  increasePercentage: number;
  categories: { id: number; name: string }[];
  trendBreakdown: string[];
  active: boolean;
}

/**
 * Scrape from Google Trends RSS feed (daily trending searches)
 */
async function scrapeRSS(): Promise<ScrapedTopic[]> {
  const topics: ScrapedTopic[] = [];

  try {
    const resp = await fetch("https://trends.google.com/trending/rss?geo=US", {
      headers: { "User-Agent": randomUA() },
    });
    if (!resp.ok) throw new Error(`RSS HTTP ${resp.status}`);

    const text = await resp.text();
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

    for (const item of items) {
      const titleMatch = item.match(/<title>([^<]+)<\/title>/);
      const trafficMatch = item.match(
        /<ht:approx_traffic>([^<]+)<\/ht:approx_traffic>/
      );
      const newsItems =
        item.match(
          /<ht:news_item_title>([^<]+)<\/ht:news_item_title>/g
        ) || [];

      if (titleMatch) {
        const breakdowns = newsItems
          .map((n) => {
            const m = n.match(
              /<ht:news_item_title>([^<]+)<\/ht:news_item_title>/
            );
            return m ? m[1].replace(/&amp;/g, "&").replace(/&apos;/g, "'") : "";
          })
          .filter(Boolean);

        let volume = 0;
        if (trafficMatch) {
          const v = trafficMatch[1].replace(/[^0-9]/g, "");
          volume = parseInt(v) || 0;
        }

        topics.push({
          query: titleMatch[1]
            .trim()
            .replace(/&amp;/g, "&")
            .replace(/&apos;/g, "'"),
          searchVolume: volume,
          increasePercentage: 0,
          categories: [],
          trendBreakdown: breakdowns,
          active: true,
        });
      }
    }
  } catch (err) {
    console.error("RSS scrape failed:", err);
  }

  return topics;
}

/**
 * Scrape from SerpApi Google Trends Trending Now (if API key available)
 */
async function scrapeSerpApi(): Promise<ScrapedTopic[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];

  const topics: ScrapedTopic[] = [];

  try {
    const resp = await fetch(
      `https://serpapi.com/search.json?engine=google_trends_trending_now&geo=US&hl=en&api_key=${apiKey}`
    );
    if (!resp.ok) throw new Error(`SerpApi HTTP ${resp.status}`);

    const data = await resp.json();

    for (const item of data.trending_searches || []) {
      topics.push({
        query: item.query || "",
        searchVolume: item.search_volume || 0,
        increasePercentage: item.increase_percentage || 0,
        categories: (item.categories || []).map(
          (c: { id: number; name: string }) => ({
            id: c.id,
            name: c.name,
          })
        ),
        trendBreakdown: (item.trend_breakdown || []).filter(
          (t: string) => typeof t === "string"
        ),
        active: item.active ?? true,
      });
    }
  } catch (err) {
    console.error("SerpApi scrape failed:", err);
  }

  return topics;
}

/**
 * Scrape via external scraper service (Browserless, ScrapingBee, etc.)
 * This approach uses a cloud browser service to render the page
 */
async function scrapeViaBrowserService(): Promise<ScrapedTopic[]> {
  const browserlessKey = process.env.BROWSERLESS_KEY;
  if (!browserlessKey) return [];

  const topics: ScrapedTopic[] = [];

  try {
    // Use Browserless.io to execute our scraping script
    const resp = await fetch(
      `https://chrome.browserless.io/function?token=${browserlessKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: `
            module.exports = async ({ page }) => {
              await page.goto('https://trends.google.com/trending?geo=US&hl=en', { waitUntil: 'networkidle0', timeout: 30000 });
              await page.waitForSelector('table tbody tr', { timeout: 15000 });
              
              // Try to dismiss cookie banner
              try { await page.click('button:has-text("Got it")', { timeout: 2000 }); } catch {}
              
              const allTopics = [];
              let pages = 0;
              
              while (pages < 20) {
                const pageData = await page.evaluate(() => {
                  const rows = document.querySelectorAll('table tbody tr');
                  const data = [];
                  for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 3) continue;
                    let query = '';
                    const qe = row.querySelector('.mZ3RIc');
                    if (qe) query = qe.textContent.trim();
                    if (!query) continue;
                    let sv = 0;
                    const ve = row.querySelector('.lqv0Cb');
                    if (ve) { const vm = ve.textContent.trim().match(/(\\d+(?:\\.\\d+)?)(M|K)?\\+/); if (vm) { sv = parseFloat(vm[1]); if (vm[2]==='M') sv*=1e6; else if (vm[2]==='K') sv*=1e3; } }
                    let pct = 0;
                    const pe = row.querySelector('.TXt85b');
                    if (pe) { const pm = pe.textContent.trim().match(/(\\d{1,3}(?:,\\d{3})*)%/); if (pm) pct = parseFloat(pm[1].replace(/,/g,'')); }
                    let ha = 0;
                    const se = row.querySelector('.vdw3Ld');
                    if (se) { const st = se.textContent.trim(); const hm=st.match(/(\\d+)\\s*hours?/); const dm=st.match(/(\\d+)\\s*days?/); if(hm) ha=parseInt(hm[1]); else if(dm) ha=parseInt(dm[1])*24; }
                    const active = row.textContent.includes('Active');
                    const bd = [];
                    row.querySelectorAll('button').forEach(b => {
                      const t = b.textContent.trim();
                      if (t.match(/^select row$/i)||t.match(/^\\d+\\s*(hours?|days?|min)/i)||t.match(/^see \\d+/i)||t.match(/^\\+/)||t.match(/more_vert|checklist|query_stats|more actions|^select$|^explore$|search it/i)||t===query||t.length<=1||t.length>=200||t.includes('arrow_upward')) return;
                      bd.push(t);
                    });
                    data.push({query,searchVolume:sv,increasePercentage:pct,active,trendBreakdown:bd,categories:[]});
                  }
                  return data;
                });
                
                allTopics.push(...pageData);
                
                const nextBtn = await page.$('button[aria-label="Go to next page"]');
                if (!nextBtn) break;
                const disabled = await nextBtn.evaluate(el => el.disabled);
                if (disabled) break;
                await nextBtn.click();
                await page.waitForTimeout(2000);
                pages++;
              }
              
              return { data: allTopics, type: 'application/json' };
            };
          `,
        }),
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      topics.push(...(data.data || data || []));
    }
  } catch (err) {
    console.error("Browserless scrape failed:", err);
  }

  return topics;
}

/**
 * Accept externally scraped data via POST
 * This allows the Mac mini scraper to push data to the cloud
 */
async function handleExternalData(
  data: ScrapedTopic[]
): Promise<{ added: number; totalTopics: number }> {
  const scrapeId = randomUUID();
  const result = await addTopics(data, scrapeId);
  await generateEmbeddings();
  return result;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("=== Cron scrape triggered ===", new Date().toISOString());

  const allTopics: ScrapedTopic[] = [];

  // Try multiple sources
  // 1. SerpApi (best quality if available)
  const serpApiTopics = await scrapeSerpApi();
  allTopics.push(...serpApiTopics);
  console.log(`SerpApi: ${serpApiTopics.length} topics`);

  await sleep(1000);

  // 2. Cloud browser service
  const browserTopics = await scrapeViaBrowserService();
  allTopics.push(...browserTopics);
  console.log(`Browser service: ${browserTopics.length} topics`);

  // 3. RSS feed (always available, lowest quality)
  const rssTopics = await scrapeRSS();
  // Only add RSS topics not already found
  const existing = new Set(allTopics.map((t) => t.query.toLowerCase()));
  const newRss = rssTopics.filter(
    (t) => !existing.has(t.query.toLowerCase())
  );
  allTopics.push(...newRss);
  console.log(`RSS: ${newRss.length} new topics (${rssTopics.length} total)`);

  if (allTopics.length === 0) {
    return NextResponse.json(
      { error: "No topics scraped from any source" },
      { status: 500 }
    );
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = allTopics.filter((t) => {
    const key = t.query.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Store and embed
  const scrapeId = randomUUID();
  const result = await addTopics(unique, scrapeId);
  console.log(`Stored: ${result.added} topics (${result.totalTopics} total)`);

  await generateEmbeddings();

  return NextResponse.json({
    success: true,
    scraped: unique.length,
    sources: {
      serpApi: serpApiTopics.length,
      browser: browserTopics.length,
      rss: newRss.length,
    },
    ...result,
  });
}

export async function POST(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const topics = Array.isArray(body) ? body : body.topics || body.data || [];

    if (topics.length === 0) {
      return NextResponse.json(
        { error: "No topics in request body" },
        { status: 400 }
      );
    }

    console.log(`Receiving ${topics.length} externally scraped topics`);
    const result = await handleExternalData(topics);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
