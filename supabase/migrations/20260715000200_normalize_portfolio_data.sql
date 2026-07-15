-- Normalize the transitional portfolio_state documents into dedicated tables.
-- Safe to run from Supabase SQL Editor after 20260715000100.

create table if not exists public.store_metadata (
  key text primary key,
  value text not null
);

create table if not exists public.portfolio_users (
  id bigint primary key,
  supabase_id text unique,
  name text not null,
  phone text unique,
  email text unique,
  role text not null default 'member' check (role in ('member', 'admin')),
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_access (
  user_id bigint not null references public.portfolio_users(id) on delete cascade,
  area text not null check (area in ('admin', 'candidate', 'recruiter')),
  primary key (user_id, area)
);

create table if not exists public.submissions (
  id bigint primary key,
  user_id bigint references public.portfolio_users(id) on delete set null,
  type text not null,
  title text not null,
  name text not null,
  email text,
  message text,
  category text,
  rating text,
  project_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.content_likes (
  id bigserial primary key,
  content_id text not null,
  identity text not null,
  created_at timestamptz not null default now(),
  constraint uq_content_like_identity unique (content_id, identity)
);

create table if not exists public.content_comments (
  id bigserial primary key,
  source_comment_id bigint not null,
  content_id text not null,
  user_id bigint references public.portfolio_users(id) on delete set null,
  author text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint uq_content_comment_source unique (content_id, source_comment_id)
);

create table if not exists public.blogs (
  id bigint primary key,
  sort_order integer not null,
  payload jsonb not null
);

create table if not exists public.projects (
  id bigint primary key,
  sort_order integer not null,
  payload jsonb not null
);

create index if not exists submissions_status_created_idx on public.submissions (status, created_at desc);
create index if not exists submissions_type_created_idx on public.submissions (type, created_at desc);
create index if not exists content_likes_content_idx on public.content_likes (content_id);
create index if not exists content_comments_content_created_idx on public.content_comments (content_id, created_at desc);

-- Backfill users from the already-migrated application document.
with app as (
  select value::jsonb as document from public.portfolio_state where key = 'application'
), source as (
  select user_json from app, jsonb_array_elements(coalesce(document->'users', '[]'::jsonb)) user_json
)
insert into public.portfolio_users (id, supabase_id, name, phone, email, role, password_hash, created_at)
select (user_json->>'id')::bigint, user_json->>'supabase_id', user_json->>'name', user_json->>'phone',
       user_json->>'email', coalesce(user_json->>'role', 'member'), user_json->>'password_hash',
       coalesce((user_json->>'created_at')::timestamptz, now())
from source on conflict (id) do nothing;

with app as (
  select value::jsonb as document from public.portfolio_state where key = 'application'
), source as (
  select (user_json->>'id')::bigint as user_id, access.area
  from app, jsonb_array_elements(coalesce(document->'users', '[]'::jsonb)) user_json
  cross join lateral jsonb_array_elements_text(coalesce(user_json->'access', '[]'::jsonb)) access(area)
)
insert into public.user_access (user_id, area)
select user_id, area from source on conflict do nothing;

with app as (
  select value::jsonb as document from public.portfolio_state where key = 'application'
), source as (
  select submission from app, jsonb_array_elements(coalesce(document->'submissions', '[]'::jsonb)) submission
)
insert into public.submissions (id, user_id, type, title, name, email, message, category, rating, project_id, status, created_at)
select (submission->>'id')::bigint, nullif(submission->>'user_id', '')::bigint,
       submission->>'type', submission->>'title', submission->>'name', submission->>'email',
       submission->>'message', submission->>'category', submission->>'rating', submission->>'project_id',
       coalesce(submission->>'status', 'pending'), coalesce((submission->>'created_at')::timestamptz, now())
from source on conflict (id) do nothing;

with app as (
  select value::jsonb as document from public.portfolio_state where key = 'application'
), records as (
  select entry.key as content_id, entry.value as record
  from app cross join lateral jsonb_each(coalesce(document->'interactions', '{}'::jsonb)) entry
), source as (
  select content_id, likes.identity
  from records cross join lateral jsonb_array_elements_text(coalesce(record->'likes', '[]'::jsonb)) likes(identity)
)
insert into public.content_likes (content_id, identity)
select content_id, identity from source on conflict (content_id, identity) do nothing;

with app as (
  select value::jsonb as document from public.portfolio_state where key = 'application'
), records as (
  select entry.key as content_id, entry.value as record
  from app cross join lateral jsonb_each(coalesce(document->'interactions', '{}'::jsonb)) entry
), source as (
  select content_id, comment
  from records cross join lateral jsonb_array_elements(coalesce(record->'comments', '[]'::jsonb)) comment
)
insert into public.content_comments (source_comment_id, content_id, author, message, created_at)
select (comment->>'id')::bigint, content_id, comment->>'author', comment->>'message',
       coalesce((comment->>'created_at')::timestamptz, now())
from source on conflict (content_id, source_comment_id) do nothing;

with source as (
  select item, ordinality - 1 as sort_order
  from public.portfolio_state state
  cross join lateral jsonb_array_elements(state.value::jsonb) with ordinality as valueset(item, ordinality)
  where state.key = 'content:blogs.json'
)
insert into public.blogs (id, sort_order, payload)
select (item->>'id')::bigint, sort_order, item from source on conflict (id) do nothing;

with source as (
  select item, ordinality - 1 as sort_order
  from public.portfolio_state state
  cross join lateral jsonb_array_elements(state.value::jsonb) with ordinality as valueset(item, ordinality)
  where state.key = 'content:projects.json'
)
insert into public.projects (id, sort_order, payload)
select (item->>'id')::bigint, sort_order, item from source on conflict (id) do nothing;

insert into public.store_metadata (key, value)
values ('application_initialized', 'true')
on conflict (key) do update set value = excluded.value;

alter table public.portfolio_users enable row level security;
alter table public.user_access enable row level security;
alter table public.submissions enable row level security;
alter table public.content_likes enable row level security;
alter table public.content_comments enable row level security;
alter table public.blogs enable row level security;
alter table public.projects enable row level security;
alter table public.store_metadata enable row level security;

revoke all on table public.portfolio_users, public.user_access, public.submissions,
  public.content_likes, public.content_comments, public.blogs, public.projects from anon, authenticated;
revoke all on table public.store_metadata from anon, authenticated;

-- Keep portfolio_state temporarily as a rollback source. Remove it only after
-- the normalized FastAPI deployment has been verified in production.
