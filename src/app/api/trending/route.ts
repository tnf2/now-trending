import { NextRequest, NextResponse } from "next/server";
import { loadDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = await loadDb();
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") || "50"
    );

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const trending = db.topics
      .filter((t) => t.lastSeen > oneDayAgo)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
      .slice(0, limit)
      .map((t) => ({
        query: t.query,
        searchVolume: t.searchVolume,
        increasePercentage: t.increasePercentage,
        categories: t.categories,
        trendBreakdown: t.trendBreakdown,
        firstSeen: t.firstSeen,
        lastSeen: t.lastSeen,
        active: t.active,
        hoursAgo: Math.round(
          (Date.now() - t.lastSeen) / (60 * 60 * 1000)
        ),
      }));

    return NextResponse.json({
      trending,
      count: trending.length,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
