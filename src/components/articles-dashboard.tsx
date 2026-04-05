"use client";

import { useEffect, useMemo, useState } from "react";
import { REFRESH_BATCH_IDS } from "@/lib/refresh/batches";
import { combineRefreshSummaries } from "@/lib/refresh/summary";
import { formatPacificDate } from "@/lib/utils";
import { ArticleListItem, RefreshRunSummary, SourceRecord } from "@/types";

interface ArticlesResponse {
  items: ArticleListItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface HealthResponse {
  ok: boolean;
  appUrl: string | null;
  database: {
    host: string;
    database: string | null;
  } | null;
  article_count?: number;
  active_source_count?: number;
  total_source_count?: number;
  recentLogs?: Array<{
    source_slug: string;
    status: string;
    inserted_count: number;
    error_message: string | null;
    created_at: string;
  }>;
  error?: string;
}

const PAGE_SIZE = 20;

export function ArticlesDashboard() {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [refreshSummary, setRefreshSummary] = useState<RefreshRunSummary | null>(null);
  const [filters, setFilters] = useState({
    source: "",
    kind: "",
    category: "",
    unreadOnly: false
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sourceOptions = useMemo(
    () =>
      sources.map((source) => ({
        value: source.slug,
        label: source.name
      })),
    [sources]
  );

  useEffect(() => {
    void loadSources();
    void loadHealth();
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [page, filters.source, filters.kind, filters.category, filters.unreadOnly]);

  async function loadSources() {
    try {
      const response = await fetch("/api/sources", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load sources");
      }

      const data = (await response.json()) as { sources: SourceRecord[] };
      setSources(data.sources);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Failed to load sources";
      setError(message);
    }
  }

  async function loadHealth() {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const data = (await response.json()) as HealthResponse;
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }

  async function loadArticles() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE)
      });

      if (filters.source) {
        params.set("source", filters.source);
      }

      if (filters.kind) {
        params.set("kind", filters.kind);
      }

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.unreadOnly) {
        params.set("unreadOnly", "true");
      }

      const response = await fetch(`/api/articles?${params.toString()}`, {
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to load articles");
      }

      const data = (await response.json()) as ArticlesResponse;
      setItems(data.items);
      setTotal(data.total);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Failed to load articles";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);

    try {
      const summaries: RefreshRunSummary[] = [];

      for (const batchId of REFRESH_BATCH_IDS) {
        const response = await fetch(`/api/refresh?batch=${batchId}`, {
          method: "POST"
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? `Refresh failed on batch ${batchId}`);
        }

        summaries.push((await response.json()) as RefreshRunSummary);
      }

      const summary = combineRefreshSummaries(summaries);
      setRefreshSummary(summary);
      await loadArticles();
      await loadSources();
      await loadHealth();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Refresh failed";
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }

  async function toggleRead(id: number, isRead: boolean) {
    const previous = items;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: isRead } : item))
    );

    try {
      const response = await fetch(`/api/articles/${id}/read`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ isRead })
      });

      if (!response.ok) {
        throw new Error("Failed to update article");
      }
    } catch (requestError) {
      setItems(previous);
      const message =
        requestError instanceof Error ? requestError.message : "Failed to update article";
      setError(message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[color:var(--accent)]">
              RSS Reader · Vercel + Supabase
            </p>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              Track tech newsrooms and media without tab fatigue.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
              Aggregates major technology media, company newsrooms, and semiconductor
              announcements into one timeline with read tracking and refresh logs.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full bg-[color:var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Run refresh now"}
            </button>
            <p className="text-sm text-[color:var(--muted)]">
              Cron runs every 30 minutes in 4 batches and respects the PT 5:00-22:00 window.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-[color:var(--line)] bg-[rgba(255,255,255,0.68)] p-5 shadow-[var(--shadow)] md:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Source</span>
          <select
            value={filters.source}
            onChange={(event) => {
              setPage(1);
              setFilters((current) => ({ ...current, source: event.target.value }));
            }}
            className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none"
          >
            <option value="">All sources</option>
            {sourceOptions.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Kind</span>
          <select
            value={filters.kind}
            onChange={(event) => {
              setPage(1);
              setFilters((current) => ({ ...current, kind: event.target.value }));
            }}
            className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none"
          >
            <option value="">All kinds</option>
            <option value="media">Media</option>
            <option value="company">Company</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Category</span>
          <select
            value={filters.category}
            onChange={(event) => {
              setPage(1);
              setFilters((current) => ({ ...current, category: event.target.value }));
            }}
            className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none"
          >
            <option value="">All categories</option>
            <option value="news_media">News media</option>
            <option value="tech_company">Tech companies</option>
            <option value="semiconductor">Semiconductors</option>
          </select>
        </label>

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm">
          <span className="font-medium text-[color:var(--muted)]">Unread only</span>
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(event) => {
              setPage(1);
              setFilters((current) => ({ ...current, unreadOnly: event.target.checked }));
            }}
            className="h-5 w-5 accent-[color:var(--accent)]"
          />
        </label>
      </section>

      {refreshSummary ? (
        <section className="rounded-[2rem] border border-[color:var(--line)] bg-[rgba(255,255,255,0.7)] p-5 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
            <span>{refreshSummary.insertedCount} new articles inserted</span>
            <span>{refreshSummary.fetchedCount} items fetched</span>
            <span>{refreshSummary.successCount} sources succeeded</span>
            <span>{refreshSummary.failureCount} sources failed</span>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {!loading && !items.length && health ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p>
            No articles are currently visible. Database host:{" "}
            <strong>{health.database?.host ?? "unknown"}</strong>. Active sources:{" "}
            <strong>{health.active_source_count ?? 0}</strong>. Stored articles:{" "}
            <strong>{health.article_count ?? 0}</strong>.
          </p>
          {health.recentLogs?.some((log) => log.status !== "success") ? (
            <p className="mt-2">
              Recent failing sources:{" "}
              {health.recentLogs
                ?.filter((log) => log.status !== "success")
                .slice(0, 4)
                .map((log) => `${log.source_slug} (${log.status})`)
                .join(", ")}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-[color:var(--muted)]">
            {loading ? "Loading feed timeline..." : `${total.toLocaleString()} articles`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-[color:var(--muted)]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[2rem] border border-[color:var(--line)] bg-[rgba(255,255,255,0.75)] p-5 shadow-[var(--shadow)]"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                <span>{item.source_name}</span>
                <span>•</span>
                <span>{item.source_category.replaceAll("_", " ")}</span>
                <span>•</span>
                <span>{formatPacificDate(item.published_at)}</span>
              </div>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-2xl leading-tight transition hover:text-[color:var(--accent)]"
                  >
                    {item.title}
                  </a>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    {item.summary ?? "No summary was available for this article."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRead(item.id, !item.is_read)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    item.is_read
                      ? "border border-[color:var(--line)] bg-white text-[color:var(--muted)]"
                      : "bg-[color:var(--accent)] text-white"
                  }`}
                >
                  {item.is_read ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </article>
          ))}

          {!loading && !items.length ? (
            <div className="rounded-[2rem] border border-dashed border-[color:var(--line)] bg-[rgba(255,255,255,0.55)] px-6 py-12 text-center text-[color:var(--muted)]">
              No articles matched the current filters yet. Run a refresh after setting
              `DATABASE_URL` so the aggregator can fetch your sources.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
