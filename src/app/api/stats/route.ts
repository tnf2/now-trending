import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
