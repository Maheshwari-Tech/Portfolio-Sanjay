-- FastAPI owns these tables. They are deliberately unavailable through the
-- Supabase browser Data API; all access goes through authenticated API routes.

create table if not exists public.portfolio_state (
  key varchar(100) primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.otp_challenges (
  identifier varchar(320) primary key,
  code_hash varchar(128) not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0)
);

create index if not exists otp_challenges_expires_at_idx
  on public.otp_challenges (expires_at);

alter table public.portfolio_state enable row level security;
alter table public.otp_challenges enable row level security;

revoke all on table public.portfolio_state from anon, authenticated;
revoke all on table public.otp_challenges from anon, authenticated;

comment on table public.portfolio_state is
  'Server-only application state for the Sanjay Gandhi portfolio FastAPI service.';
comment on table public.otp_challenges is
  'Server-only hashed and expiring local-provider OTP challenges; never stores plaintext codes.';
