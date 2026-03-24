import { load } from "cheerio";
import { normalizeUrl, stripHtml, truncate } from "@/lib/utils";
import { ScrapedArticleCandidate } from "@/types";

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function discoverFeedLinks(html: string, baseUrl: string) {
  const $ = load(html);
  const links = new Set<string>();

  $('link[rel="alternate"]').each((_, element) => {
    const type = ($(element).attr("type") ?? "").toLowerCase();
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    if (type.includes("rss") || type.includes("atom") || href.endsWith(".xml")) {
      links.add(normalizeUrl(href, baseUrl));
    }
  });

  $('a[href]').each((_, element) => {
    const href = $(element).attr("href");
    if (!href) {
      return;
    }

    const normalized = normalizeUrl(href, baseUrl);
    if (/(rss|atom|feed|\.xml)(\?|$)/i.test(normalized)) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}

function collectContainers(html: string) {
  const $ = load(html);
  const selectors = [
    "article",
    "main li",
    "main section > div",
    "[data-testid*='story']",
    "[class*='story']",
    "[class*='post']",
    "[class*='article']"
  ];
  const containers = new Map<string, string>();

  for (const selector of selectors) {
    $(selector).each((index, element) => {
      if (index > 60) {
        return false;
      }

      containers.set(`${selector}-${index}`, $.html(element));
      return undefined;
    });
  }

  if (!containers.size) {
    $("main a[href]").each((index, element) => {
      if (index > 80) {
        return false;
      }

      containers.set(`anchor-${index}`, $.html(element));
      return undefined;
    });
  }

  return Array.from(containers.values());
}

export function scrapeArticlesFromHtml(
  html: string,
  baseUrl: string
): ScrapedArticleCandidate[] {
  const candidates = new Map<string, ScrapedArticleCandidate>();

  for (const fragment of collectContainers(html)) {
    const $ = load(fragment);
    const primaryLink = $("a[href]").first();
    const href = primaryLink.attr("href");
    const url = href ? normalizeUrl(href, baseUrl) : null;

    if (!url || !/^https?:\/\//.test(url)) {
      continue;
    }

    const title =
      $("h1, h2, h3, h4").first().text().trim() ||
      primaryLink.text().trim() ||
      primaryLink.attr("title")?.trim() ||
      "";

    if (title.length < 12) {
      continue;
    }

    const summary =
      truncate(
        stripHtml(
          $("p").first().text().trim() ||
            primaryLink.closest("article").find("p").first().text().trim() ||
            null
        ),
        280
      ) ?? null;

    const timeValue =
      $("time").first().attr("datetime") ||
      $("time").first().text().trim() ||
      primaryLink.parent().find("time").first().attr("datetime") ||
      null;

    candidates.set(url, {
      title,
      url,
      summary,
      publishedAt: parseDate(timeValue)
    });
  }

  return Array.from(candidates.values()).slice(0, 20);
}
