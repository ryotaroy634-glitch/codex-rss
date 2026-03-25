import { handleCronRefresh } from "@/lib/refresh/handlers";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  return handleCronRefresh(request, "2");
}
