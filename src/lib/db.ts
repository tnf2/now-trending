/**
 * Database layer using Vercel Blob for persistent storage
 * Falls back to in-memory + local file for development
 */

import { put, list, head, del } from "@vercel/blob";

const BLOB_PREFIX = "now-trending/";
const DB_KEY = `${BLOB_PREFIX}trends.json`;

export interface Topic {
  query: string;
  searchVolume: number;
  increasePercentage: number;
  categories: { id: number; name: string }[];
  trendBreakdown: string[];
  active: boolean;
  hoursAgo?: number;
  firstSeen: number;
  lastSeen: number;
  embedding: number[] | null;
  scrapeHistory: {
    scrapeId: string;
    timestamp: number;
    searchVolume: number;
    active: boolean;
  }[];
}

export interface TrendsDb {
  version: number;
  scrapes: { id: string; timestamp: number; topicCount: number }[];
  topics: Topic[];
  meta: {
    lastScrape: number | null;
    totalScrapes: number;
  };
}

function emptyDb(): TrendsDb {
  return {
    version: 1,
    scrapes: [],
    topics: [],
    meta: { lastScrape: null, totalScrapes: 0 },
  };
}

// In-memory cache to avoid repeated blob reads
let dbCache: TrendsDb | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function loadDb(): Promise<TrendsDb> {
  const now = Date.now();
  if (dbCache && now - cacheTimestamp < CACHE_TTL) {
    return dbCache;
  }

  try {
    const blobs = await list({ prefix: "now-trending/trends" });
    const existing = blobs.blobs.find((b) => b.pathname === "now-trending/trends.json");
    if (existing) {
      const resp = await fetch(existing.url);
      const data = (await resp.json()) as TrendsDb;
      dbCache = data;
      cacheTimestamp = now;
      return data;
    }
  } catch (err) {
    console.error("Failed to load from blob:", err);
  }

  return emptyDb();
}

export async function saveDb(db: TrendsDb): Promise<void> {
  try {
    await put("now-trending/trends.json", JSON.stringify(db), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    dbCache = db;
    cacheTimestamp = Date.now();
  } catch (err) {
    console.error("Failed to save to blob:", err);
    throw err;
  }
}

export async function addTopics(
  topics: Omit<Topic, "firstSeen" | "lastSeen" | "embedding" | "scrapeHistory">[],
  scrapeId: string
): Promise<{ added: number; totalTopics: number }> {
  const db = await loadDb();
  const now = Date.now();

  db.scrapes.push({
    id: scrapeId,
    timestamp: now,
    topicCount: topics.length,
  });

  for (const topic of topics) {
    const existing = db.topics.find(
      (t) => t.query.toLowerCase() === topic.query.toLowerCase()
    );
    if (existing) {
      existing.lastSeen = now;
      existing.searchVolume = topic.searchVolume;
      existing.increasePercentage = topic.increasePercentage;
      existing.active = topic.active;
      existing.scrapeHistory.push({
        scrapeId,
        timestamp: now,
        searchVolume: topic.searchVolume,
        active: topic.active,
      });
      if (topic.trendBreakdown) {
        const newBreakdowns = topic.trendBreakdown.filter(
          (b) => !existing.trendBreakdown.includes(b)
        );
        existing.trendBreakdown.push(...newBreakdowns);
      }
    } else {
      db.topics.push({
        ...topic,
        firstSeen: now,
        lastSeen: now,
        embedding: null,
        scrapeHistory: [
          {
            scrapeId,
            timestamp: now,
            searchVolume: topic.searchVolume,
            active: topic.active,
          },
        ],
      });
    }
  }

  // Prune topics older than 30 days
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  db.topics = db.topics.filter((t) => t.lastSeen > thirtyDaysAgo);
  db.scrapes = db.scrapes.filter((s) => s.timestamp > thirtyDaysAgo);

  db.meta.lastScrape = now;
  db.meta.totalScrapes = db.scrapes.length;

  await saveDb(db);
  return { added: topics.length, totalTopics: db.topics.length };
}

export async function getTopicsWithoutEmbeddings(): Promise<Topic[]> {
  const db = await loadDb();
  return db.topics.filter((t) => !t.embedding);
}

export async function updateEmbeddings(
  embeddingMap: Record<string, number[]>
): Promise<void> {
  const db = await loadDb();
  for (const topic of db.topics) {
    if (embeddingMap[topic.query]) {
      topic.embedding = embeddingMap[topic.query];
    }
  }
  await saveDb(db);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchByEmbedding(
  queryEmbedding: number[],
  limit = 20,
  minSimilarity = 0.25
) {
  const db = await loadDb();
  const results: {
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
  }[] = [];

  for (const topic of db.topics) {
    if (!topic.embedding) continue;
    const similarity = cosineSimilarity(queryEmbedding, topic.embedding);
    if (similarity >= minSimilarity) {
      results.push({
        query: topic.query,
        similarity,
        searchVolume: topic.searchVolume,
        increasePercentage: topic.increasePercentage,
        categories: topic.categories,
        trendBreakdown: topic.trendBreakdown,
        firstSeen: topic.firstSeen,
        lastSeen: topic.lastSeen,
        active: topic.active,
        daysAgo: Math.round(
          (Date.now() - topic.lastSeen) / (24 * 60 * 60 * 1000)
        ),
      });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}

export async function getStats() {
  const db = await loadDb();
  return {
    totalTopics: db.topics.length,
    totalScrapes: db.scrapes.length,
    topicsWithEmbeddings: db.topics.filter((t) => t.embedding).length,
    lastScrape: db.meta.lastScrape
      ? new Date(db.meta.lastScrape).toISOString()
      : null,
    oldestTopic:
      db.topics.length > 0
        ? new Date(
            Math.min(...db.topics.map((t) => t.firstSeen))
          ).toISOString()
        : null,
  };
}
