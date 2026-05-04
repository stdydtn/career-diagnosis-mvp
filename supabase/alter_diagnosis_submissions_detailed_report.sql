-- 이미 diagnosis_submissions 가 answers 컬럼으로 존재할 때 한 번 실행하세요.
-- answers 제거, 상세 리포트 JSON(detailed_report) 추가

alter table public.diagnosis_submissions
  add column if not exists detailed_report jsonb not null default '{}'::jsonb;

alter table public.diagnosis_submissions
  drop column if exists answers;

comment on column public.diagnosis_submissions.detailed_report is 'createDetailedReport() 결과(요약·단계·추천직무·실행전략 등)';
