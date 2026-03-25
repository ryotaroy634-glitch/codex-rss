import { NextResponse } from "next/server";
import { isAuthorizedCronRequest, isAuthorizedRefreshRequest } from "@/lib/api/auth";
import { refreshAllSources } from "@/lib/feeds/ingest";
import {
  isRefreshBatchId,
  REFRESH_BATCHES,
  type RefreshBatchId
} from "@/lib/refresh/batches";

export async function handleManualRefresh(request: Request) {
  if (!isAuthorizedRefreshRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batch = new URL(request.url).searchParams.get("batch");
  if (!isRefreshBatchId(batch)) {
    return NextResponse.json(
      { error: "Invalid or missing refresh batch. Expected one of 1, 2, 3, 4." },
      { status: 400 }
    );
  }

  try {
    const summary = await refreshAllSources({
      force: true,
      sourceSlugs: REFRESH_BATCHES[batch]
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function handleCronRefresh(request: Request, batch: RefreshBatchId) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await refreshAllSources({
      sourceSlugs: REFRESH_BATCHES[batch]
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
