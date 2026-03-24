import { NextRequest, NextResponse } from "next/server";
import { listArticles } from "@/lib/db/repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? "20")));

    const result = await listArticles({
      page,
      pageSize,
      source: params.get("source"),
      kind: params.get("kind"),
      category: params.get("category"),
      unreadOnly: params.get("unreadOnly") === "true"
    });

    return NextResponse.json({
      ...result,
      page,
      pageSize
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
