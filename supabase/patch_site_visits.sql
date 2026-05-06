-- 서비스 방문 집계용. SQL Editor 에서 한 번 실행하세요.

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now()
);

comment on table public.site_visits is 'MVP 메인 세션당 1회 방문 기록(관리자 일/월 통계)';

alter table public.site_visits enable row level security;

drop policy if exists "allow_insert_site_visits" on public.site_visits;
drop policy if exists "allow_select_site_visits" on public.site_visits;

create policy "allow_insert_site_visits"
  on public.site_visits
  for insert
  with check (true);

create policy "allow_select_site_visits"
  on public.site_visits
  for select
  using (true);

grant usage on schema public to anon, authenticated;
grant insert, select on table public.site_visits to anon, authenticated;
