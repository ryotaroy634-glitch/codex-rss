import { sleep } from "@/lib/utils";

const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (compatible; RSSAggregatorBot/1.0; +https://vercel.com)",
  accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8"
};

interface FetchWithRetryOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
) {
  const { timeoutMs = 15000, retries = 3, headers, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeout =
      controller && timeoutMs > 0
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...DEFAULT_HEADERS,
          ...(headers ?? {})
        },
        signal: controller?.signal,
        cache: "no-store"
      });

      if (timeout) {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status} for ${url}`);
      }

      return response;
    } catch (error) {
      if (timeout) {
        clearTimeout(timeout);
      }
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await sleep(2 ** attempt * 400);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
}

export async function fetchText(url: string, options: FetchWithRetryOptions = {}) {
  const response = await fetchWithRetry(url, options);
  return response.text();
}
