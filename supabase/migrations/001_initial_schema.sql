-- SignalFeed: AI-uutiskuraattori
-- Alkuperäinen skeema

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  feed_url text not null unique,
  category text not null default 'tech',
  language text not null default 'en',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  title text not null,
  url text not null unique,
  author text,
  published_at timestamptz,
  content text,
  content_snippet text,
  fetched_at timestamptz not null default now()
);

create index idx_articles_source_id on articles(source_id);
create index idx_articles_published_at on articles(published_at desc);

create table if not exists curated_articles (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade unique,
  relevance_score integer not null check (relevance_score between 1 and 10),
  reasoning text not null,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  summary_fi text,
  curated_at timestamptz not null default now()
);

create index idx_curated_relevance on curated_articles(relevance_score desc);

create table if not exists digests (
  id uuid primary key default gen_random_uuid(),
  digest_date date not null unique,
  title text not null,
  intro_text text,
  article_ids uuid[] not null default '{}',
  article_count integer not null,
  created_at timestamptz not null default now()
);

create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  min_relevance_score integer not null default 6,
  categories text[] not null default '{tech,ai}',
  language text not null default 'fi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Päivitä updated_at automaattisesti
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sources_updated_at
  before update on sources
  for each row execute function update_updated_at();

create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_updated_at();
