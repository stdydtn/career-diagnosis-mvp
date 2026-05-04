-- 기존 테이블을 유지한 채 RLS·권한만 고칩니다. SQL Editor 에서 한 번 실행하세요.
-- 증상: INSERT/SELECT/UPDATE 가 RLS 때문에 막힐 때

alter table if exists public.diagnosis_submissions enable row level security;

drop policy if exists "anon_insert_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "anon_select_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_insert_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_select_diagnosis_submissions" on public.diagnosis_submissions;
drop policy if exists "allow_update_diagnosis_submissions" on public.diagnosis_submissions;

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
