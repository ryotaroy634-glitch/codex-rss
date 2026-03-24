import Parser from "rss-parser";
import {
  ensureSources,
  getSourceMap,
  insertArticles,
  writeRefreshLog
} from "@/lib/db/repository";
import { fetchText } from "@/lib/feeds/fetch";
import { discoverFeedLinks, scrapeArticlesFromHtml } from "@/lib/feeds/scrape";
import { SOURCE_DEFINITIONS } from "@/lib/feeds/sources";
import { hashContent } from "@/lib/hash";
import { isWithinRefreshWindow } from "@/lib/scheduler/window";
import { stripHtml, truncate } from "@/lib/utils";
import {
  FeedItemCandidate,
  RefreshRunSummary,
  RefreshSourceResult,
  SourceDefinition
} from "@/types";

const parser = new Parser();

async function fetchFeedItems(feedUrl: string): Promise<FeedItemCandidate[]> {
  const xml = await fetchText(feedUrl, { timeoutMs: 0 });
  const parsed = await parser.parseString(xml);
  const items: FeedItemCandidate[] = [];

  for (const item of parsed.items ?? []) {
    const title = item.title?.trim();
    const url = item.link?.trim();

    if (!title || !url) {
      continue;
    }

    const publishedAt = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
        ? new Date(item.pubDate)
        : null;
    const summary = truncate(
      stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? null),
      280
    );

    items.push({
      title,
      url,
      summary: summary ?? null,
      publishedAt:
        publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      externalId: item.id ?? null
    });
  }

  return items.slice(0, 25);
}

function buildRefreshStatus({
  fetchedCount,
  errorCount
}: {
  fetchedCount: number;
  errorCount: number;
}) {
  if (fetchedCount === 0 && errorCount > 0) {
    return "failed" as const;
  }

  if (fetchedCount === 0) {
    return "failed" as const;
  }

  if (fetchedCount > 0 && errorCount > 0) {
    return "partial" as const;
  }

  return "success" as const;
}

async function refreshSingleSource(
  definition: SourceDefinition,
  sourceId: number
): Promise<RefreshSourceResult> {
  const startedAt = new Date();
  const triedFeedUrls = new Set<string>();
  const collected = new Map<string, FeedItemCandidate & { mode: "feed" | "scrape"; origin: string }>();
  const errors: string[] = [];
  let attempts = 0;

  const tryFeedUrl = async (feedUrl: string, origin: string) => {
    if (triedFeedUrls.has(feedUrl)) {
      return;
    }

    triedFeedUrls.add(feedUrl);
    attempts += 1;

    try {
      const items = await fetchFeedItems(feedUrl);
      for (const item of items) {
        collected.set(
          hashContent(item.url, item.title),
          {
            ...item,
            mode: "feed",
            origin
          }
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Feed ${feedUrl}: ${message}`);
    }
  };

  for (const feedUrl of definition.feedCandidates ?? []) {
    await tryFeedUrl(feedUrl, feedUrl);
  }

  if (collected.size > 0 && (definition.feedCandidates?.length ?? 0) > 0) {
    const items = Array.from(collected.values());
    const insertedCount = await insertArticles(
      items.map((item) => ({
        sourceId,
        title: item.title,
        url: item.url,
        summary: item.summary ?? null,
        publishedAt: item.publishedAt ?? null,
        externalId: item.externalId ?? null,
        contentHash: hashContent(item.url, item.title),
        metadata: {
          ingestedFrom: item.mode,
          origin: item.origin
        }
      }))
    );

    await writeRefreshLog({
      sourceSlug: definition.slug,
      status: "success",
      startedAt,
      finishedAt: new Date(),
      attemptCount: attempts,
      insertedCount,
      errorMessage: null
    });

    return {
      sourceSlug: definition.slug,
      insertedCount,
      fetchedCount: items.length,
      status: "success",
      attempts,
      errorMessage: null
    };
  }

  for (const entrypoint of definition.entrypoints) {
    let html: string | null = null;

    try {
      attempts += 1;
      html = await fetchText(entrypoint.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Page ${entrypoint.url}: ${message}`);
      continue;
    }

    const discoveredFeedLinks = discoverFeedLinks(html, entrypoint.url);
    for (const discoveredFeed of discoveredFeedLinks) {
      await tryFeedUrl(discoveredFeed, entrypoint.url);
    }

    if (collected.size > 0) {
      break;
    }

    const scraped = scrapeArticlesFromHtml(html, entrypoint.url);
    for (const item of scraped) {
      collected.set(
        hashContent(item.url, item.title),
        {
          title: item.title,
          url: item.url,
          summary: item.summary ?? null,
          publishedAt: item.publishedAt ?? null,
          externalId: null,
          mode: "scrape",
          origin: entrypoint.url
        }
      );
    }
  }

  const items = Array.from(collected.values());
  if (!items.length && errors.length === 0) {
    errors.push("No feed entries or scrapeable articles were discovered.");
  }

  const insertedCount = await insertArticles(
    items.map((item) => ({
      sourceId,
      title: item.title,
      url: item.url,
      summary: item.summary ?? null,
      publishedAt: item.publishedAt ?? null,
      externalId: item.externalId ?? null,
      contentHash: hashContent(item.url, item.title),
      metadata: {
        ingestedFrom: item.mode,
        origin: item.origin
      }
    }))
  );

  const status = buildRefreshStatus({
    fetchedCount: items.length,
    errorCount: errors.length
  });

  await writeRefreshLog({
    sourceSlug: definition.slug,
    status,
    startedAt,
    finishedAt: new Date(),
    attemptCount: attempts,
    insertedCount,
    errorMessage: errors.length ? errors.join(" | ") : null
  });

  return {
    sourceSlug: definition.slug,
    insertedCount,
    fetchedCount: items.length,
    status,
    attempts,
    errorMessage: errors.length ? errors.join(" | ") : null
  };
}

interface RefreshOptions {
  force?: boolean;
  sourceSlugs?: string[];
  onSourceStart?: (slug: string) => void;
  onSourceComplete?: (result: RefreshSourceResult) => void;
}

export async function refreshAllSources(options?: RefreshOptions): Promise<RefreshRunSummary> {
  const startedAt = new Date();

  if (!options?.force && !isWithinRefreshWindow(startedAt)) {
    return {
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      insertedCount: 0,
      fetchedCount: 0,
      successCount: 0,
      failureCount: 0,
      skipped: true,
      reason: "Outside Pacific Time refresh window",
      results: []
    };
  }

  await ensureSources();
  const sourceMap = await getSourceMap();
  const results: RefreshSourceResult[] = [];
  const definitions = options?.sourceSlugs?.length
    ? SOURCE_DEFINITIONS.filter((definition) => options.sourceSlugs?.includes(definition.slug))
    : SOURCE_DEFINITIONS;

  for (const definition of definitions) {
    const source = sourceMap.get(definition.slug);
    if (!source) {
      continue;
    }

    options?.onSourceStart?.(definition.slug);
    const result = await refreshSingleSource(definition, source.id);
    results.push(result);
    options?.onSourceComplete?.(result);
  }

  return {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    insertedCount: results.reduce((total, item) => total + item.insertedCount, 0),
    fetchedCount: results.reduce((total, item) => total + item.fetchedCount, 0),
    successCount: results.filter((item) => item.status === "success").length,
    failureCount: results.filter((item) => item.status === "failed").length,
    skipped: false,
    results
  };
}
