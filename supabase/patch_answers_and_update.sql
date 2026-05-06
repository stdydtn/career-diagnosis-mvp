-- 2차 저장(answers/result UPDATE)용: answers 컬럼 추가 + UPDATE 권한·정책
-- 기존 테이블이 있을 때 SQL Editor 에서 실행

alter table public.diagnosis_submissions
  add column if not exists answers jsonb not null default '{}'::jsonb;

alter table public.diagnosis_submissions
  add column if not exists ai_diagnosis jsonb,
  add column if not exists ai_report jsonb,
  add column if not exists ai_cover_letter_review jsonb;

alter table public.diagnosis_submissions enable row level security;

drop policy if exists "allow_update_diagnosis_submissions" on public.diagnosis_submissions;
create policy "allow_update_diagnosis_submissions"
  on public.diagnosis_submissions
  for update
  using (true)
  with check (true);

grant update on table public.diagnosis_submissions to anon, authenticated;
