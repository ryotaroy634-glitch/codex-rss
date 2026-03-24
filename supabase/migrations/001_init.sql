create table if not exists sources (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  kind text not null,
  category text not null,
  homepage_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id bigint generated always as identity primary key,
  source_id bigint not null references sources(id) on delete cascade,
  title text not null,
  url text not null,
  summary text,
  published_at timestamptz,
  external_id text,
  content_hash text not null unique,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists refresh_logs (
  id bigint generated always as identity primary key,
  source_slug text not null,
  status text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  attempt_count integer not null,
  inserted_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_articles_published_at on articles (published_at desc nulls last);
create index if not exists idx_articles_source_id on articles (source_id);
create index if not exists idx_refresh_logs_source_slug on refresh_logs (source_slug, created_at desc);
