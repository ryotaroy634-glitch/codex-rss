export type SourceCategory = "news_media" | "tech_company" | "semiconductor";

export type SourceKind = "media" | "company";

export type RefreshStatus = "success" | "partial" | "failed" | "skipped";

export interface FeedTarget {
  url: string;
  label?: string;
}

export interface SourceDefinition {
  slug: string;
  name: string;
  kind: SourceKind;
  category: SourceCategory;
  homepageUrl: string;
  entrypoints: FeedTarget[];
  feedCandidates?: string[];
}

export interface SourceRecord {
  id: number;
  slug: string;
  name: string;
  kind: SourceKind;
  category: SourceCategory;
  homepage_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleRecord {
  id: number;
  source_id: number;
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
  external_id: string | null;
  content_hash: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ArticleListItem extends ArticleRecord {
  source_name: string;
  source_slug: string;
  source_kind: SourceKind;
  source_category: SourceCategory;
}

export interface ArticleUpsertInput {
  sourceId: number;
  title: string;
  url: string;
  summary?: string | null;
  publishedAt?: Date | null;
  externalId?: string | null;
  contentHash: string;
  metadata?: Record<string, unknown>;
}

export interface RefreshLogInput {
  sourceSlug: string;
  status: RefreshStatus;
  startedAt: Date;
  finishedAt: Date;
  attemptCount: number;
  insertedCount: number;
  errorMessage?: string | null;
}

export interface ScrapedArticleCandidate {
  title: string;
  url: string;
  summary?: string | null;
  publishedAt?: Date | null;
}

export interface FeedItemCandidate extends ScrapedArticleCandidate {
  externalId?: string | null;
}

export interface RefreshSourceResult {
  sourceSlug: string;
  insertedCount: number;
  fetchedCount: number;
  status: RefreshStatus;
  attempts: number;
  errorMessage?: string | null;
}

export interface RefreshRunSummary {
  startedAt: string;
  finishedAt: string;
  insertedCount: number;
  fetchedCount: number;
  successCount: number;
  failureCount: number;
  skipped: boolean;
  reason?: string;
  results: RefreshSourceResult[];
}
