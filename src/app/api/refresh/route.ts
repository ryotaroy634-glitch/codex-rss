import { NextResponse } from "next/server";
import { isAuthorizedRefreshRequest } from "@/lib/api/auth";
import { refreshAllSources } from "@/lib/feeds/ingest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedRefreshRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await refreshAllSources({ force: true });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
