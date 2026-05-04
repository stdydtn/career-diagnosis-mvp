-- 기존 diagnosis_submissions 의 created_at 을 "서울 벽시각" timestamp 로 바꿉니다.
-- SQL Editor 에서 한 번 실행하세요.

alter table public.diagnosis_submissions
  alter column created_at drop default;

alter table public.diagnosis_submissions
  alter column created_at type timestamp without time zone
  using (created_at at time zone 'Asia/Seoul');

alter table public.diagnosis_submissions
  alter column created_at set default (now() at time zone 'Asia/Seoul');

alter table public.diagnosis_submissions
  alter column created_at set not null;

comment on column public.diagnosis_submissions.created_at is 'Asia/Seoul 기준 삽입 시각(타임존 오프셋 없이 KST 벽시각 저장)';
