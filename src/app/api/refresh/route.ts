import { handleManualRefresh } from "@/lib/refresh/handlers";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  return handleManualRefresh(request);
}
