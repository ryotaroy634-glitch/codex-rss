import { NextResponse } from "next/server";
import { getHealthSnapshot } from "@/lib/db/repository";

export const runtime = "nodejs";

function getDatabaseLabel() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return null;
  }

  try {
    const parsed = new URL(raw);
    return {
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, "") || null
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const snapshot = await getHealthSnapshot();

    return NextResponse.json({
      ok: true,
      appUrl: process.env.APP_URL ?? null,
      database: getDatabaseLabel(),
      ...snapshot
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        appUrl: process.env.APP_URL ?? null,
        database: getDatabaseLabel()
      },
      { status: 500 }
    );
  }
}
