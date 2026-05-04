-- 이미 diagnosis_submissions 가 있는 경우: SQL Editor 에서 실행
-- INSERT / SELECT / UPDATE RLS 및 권한 보완

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
