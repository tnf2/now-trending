import { NextRequest, NextResponse } from "next/server";
import { searchByEmbedding } from "@/lib/db";
import { embedQuery } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const minSimilarity = parseFloat(
    request.nextUrl.searchParams.get("min_sim") || "0.25"
  );

  if (!query) {
    return NextResponse.json(
      { error: 'Missing query parameter "q"' },
      { status: 400 }
    );
  }

  try {
    const queryEmbedding = await embedQuery(query);
    const results = await searchByEmbedding(queryEmbedding, limit, minSimilarity);

    return NextResponse.json({
      query,
      results,
      count: results.length,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Search error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
