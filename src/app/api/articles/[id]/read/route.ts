import { NextResponse } from "next/server";
import { markArticleRead } from "@/lib/db/repository";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = (await request.json()) as { isRead?: boolean };
    const { id } = await context.params;
    const ok = await markArticleRead(Number(id), body.isRead ?? true);

    if (!ok) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
