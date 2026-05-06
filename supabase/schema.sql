-- Supabase 대시보드 → SQL Editor 에서 실행 (기존 MVP 테이블과 충돌 시 아래 DROP 후 재생성)

create extension if not exists "pgcrypto";

drop policy if exists "anon_insert_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "anon_select_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_insert_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_select_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_update_diagnosis_submissions" on public.diagnosis_submissions;
drop table if exists public.diagnosis_submissions;

create table public.diagnosis_submissions (
  id uuid primary key default gen_random_uuid(),
  -- 서울 벽시각(한국 표준시). Table Editor 에서도 숫자 그대로 KST 로 읽으면 됩니다.
  created_at timestamp without time zone not null default (now() at time zone 'Asia/Seoul'),

  name text,
  email text,
  phone text,
  age_group text,
  status text,
  education text,
  school text,
  major text,
  gpa text,
  certificates text,
  language_scores text,
  target_job text,
  target_company_type text,
  region text,
  referral text,

  privacy_consent boolean not null default false,
  marketing_consent boolean not null default false,

  answers jsonb not null default '{}'::jsonb,
  detailed_report jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  feedback jsonb
);

comment on table public.diagnosis_submissions is '커리어 진단 MVP: 1차 프로필 INSERT → 2차 answers/result UPDATE → 후기 시 feedback/detailed_report UPDATE';
comment on column public.diagnosis_submissions.created_at is 'Asia/Seoul 기준 삽입 시각(타임존 오프셋 없이 KST 벽시각 저장)';
comment on column public.diagnosis_submissions.detailed_report is 'createDetailedReport() 결과(요약·단계·추천직무·실행전략 등)';

alter table public.diagnosis_submissions enable row level security;

create policy "allow_insert_diagnosis_submissions"
  on public.diagnosis_submissions
  for insert
  with check (true);

create policy "allow_select_diagnosis_submissions"
  on public.diagnosis_submissions
  for select
  using (true);

create policy "allow_update_diagnosis_submissions"
  on public.diagnosis_submissions
  for update
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant insert, select, update on table public.diagnosis_submissions to anon, authenticated;

-- 방문 로그 (관리자 일·월 통계)
create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visited_at timestamptz not null default now()
);

comment on table public.site_visits is 'MVP 메인 세션당 1회 방문 기록';

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

grant insert, select on table public.site_visits to anon, authenticated;
