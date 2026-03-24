import { SOURCE_DEFINITIONS } from "@/lib/feeds/sources";
import {
  ArticleListItem,
  ArticleUpsertInput,
  RefreshLogInput,
  SourceRecord
} from "@/types";
import { ensureSchema, getSql } from "./sql";

interface ArticleQueryOptions {
  page: number;
  pageSize: number;
  source?: string | null;
  kind?: string | null;
  category?: string | null;
  unreadOnly?: boolean;
}

export async function ensureSources() {
  await ensureSchema();
  const sql = getSql();
  const activeSlugs = SOURCE_DEFINITIONS.map((source) => source.slug);

  for (const source of SOURCE_DEFINITIONS) {
    await sql`
      insert into sources (slug, name, kind, category, homepage_url)
      values (${source.slug}, ${source.name}, ${source.kind}, ${source.category}, ${source.homepageUrl})
      on conflict (slug) do update
      set
        name = excluded.name,
        kind = excluded.kind,
        category = excluded.category,
        homepage_url = excluded.homepage_url,
        updated_at = now()
    `;
  }

  await sql`
    update sources
    set
      is_active = true,
      updated_at = now()
    where slug in ${sql(activeSlugs)}
  `;

  await sql`
    update sources
    set
      is_active = false,
      updated_at = now()
    where slug = 'broadcom'
  `;
}

export async function getSourceMap() {
  await ensureSources();
  const sql = getSql();
  const sources = await sql<SourceRecord[]>`
    select *
    from sources
    where is_active = true
    order by
      case category
        when 'news_media' then 1
        when 'tech_company' then 2
        else 3
      end,
      name asc
  `;

  return new Map(sources.map((source) => [source.slug, source]));
}

export async function listSources() {
  return Array.from((await getSourceMap()).values());
}

export async function insertArticles(items: ArticleUpsertInput[]) {
  if (!items.length) {
    return 0;
  }

  await ensureSchema();
  const sql = getSql();
  let insertedCount = 0;

  for (const item of items) {
    const rows = await sql<{ id: number }[]>`
      insert into articles (
        source_id,
        title,
        url,
        summary,
        published_at,
        external_id,
        content_hash,
        metadata
      )
      values (
        ${item.sourceId},
        ${item.title},
        ${item.url},
        ${item.summary ?? null},
        ${item.publishedAt?.toISOString() ?? null},
        ${item.externalId ?? null},
        ${item.contentHash},
        ${JSON.stringify(item.metadata ?? {})}::jsonb
      )
      on conflict (content_hash) do nothing
      returning id
    `;

    insertedCount += rows.length;
  }

  return insertedCount;
}

export async function writeRefreshLog(input: RefreshLogInput) {
  await ensureSchema();
  const sql = getSql();

  await sql`
    insert into refresh_logs (
      source_slug,
      status,
      started_at,
      finished_at,
      attempt_count,
      inserted_count,
      error_message
    )
    values (
      ${input.sourceSlug},
      ${input.status},
      ${input.startedAt.toISOString()},
      ${input.finishedAt.toISOString()},
      ${input.attemptCount},
      ${input.insertedCount},
      ${input.errorMessage ?? null}
    )
  `;
}

export async function listArticles(options: ArticleQueryOptions) {
  await ensureSources();
  const sql = getSql();
  const offset = (options.page - 1) * options.pageSize;

  const items = await sql<ArticleListItem[]>`
    select
      a.*,
      s.slug as source_slug,
      s.name as source_name,
      s.kind as source_kind,
      s.category as source_category
    from articles a
    inner join sources s on s.id = a.source_id
    where 1 = 1
    and s.is_active = true
    ${options.source ? sql`and s.slug = ${options.source}` : sql``}
    ${options.kind ? sql`and s.kind = ${options.kind}` : sql``}
    ${options.category ? sql`and s.category = ${options.category}` : sql``}
    ${options.unreadOnly ? sql`and a.is_read = false` : sql``}
    order by a.published_at desc nulls last, a.created_at desc
    limit ${options.pageSize}
    offset ${offset}
  `;

  const totalRows = await sql<{ count: string }[]>`
    select count(*)::text as count
    from articles a
    inner join sources s on s.id = a.source_id
    where 1 = 1
    and s.is_active = true
    ${options.source ? sql`and s.slug = ${options.source}` : sql``}
    ${options.kind ? sql`and s.kind = ${options.kind}` : sql``}
    ${options.category ? sql`and s.category = ${options.category}` : sql``}
    ${options.unreadOnly ? sql`and a.is_read = false` : sql``}
  `;

  return {
    items,
    total: Number(totalRows[0]?.count ?? 0)
  };
}

export async function markArticleRead(id: number, isRead: boolean) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql<{ id: number }[]>`
    update articles
    set is_read = ${isRead}
    where id = ${id}
    returning id
  `;

  return rows.length > 0;
}
