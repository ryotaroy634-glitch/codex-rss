import { NextResponse } from "next/server";
import { listSources } from "@/lib/db/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sources = await listSources();
    return NextResponse.json({ sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
