import React, { useCallback, useEffect, useMemo, useState } from "react";
import { questions, riasecLabels, personalityLabels, aptitudeLabels } from "./CareerDiagnosisData.js";
import { supabase } from "./lib/supabase.js";

const SESSION_KEY = "mvp_diagnosis_admin_unlock";

const FEEDBACK_LABELS = {
  satisfaction: "전반 만족도",
  usefulness: "결과 유용성",
  easyToUse: "사용 편의성",
  recommend: "추천 의향",
  paidIntent: "유료화 시 사용 의향",
  bestFeature: "가장 좋았던 기능",
  improvement: "개선 요청",
  desiredService: "추가로 원하는 서비스",
};

function formatCell(v) {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "예" : "아니오";
  return String(v);
}

function formatCreatedAt(value) {
  if (value == null || value === "") return "—";
  const raw = typeof value === "string" ? value.trim() : String(value);
  if (!raw) return "—";
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw);
  if (hasZone) {
    return new Date(raw).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  }
  return `${raw.includes("T") ? raw.replace("T", " ") : raw.replace(" ", "T").replace("T", " ")} (KST)`;
}

function readConfiguredAdminKey() {
  const fromMeta =
    typeof import.meta.env.VITE_ADMIN_KEY === "string" ? import.meta.env.VITE_ADMIN_KEY.trim() : "";
  const fromDefine = typeof __VITE_ADMIN_KEY_FROM_ENV__ === "string" ? __VITE_ADMIN_KEY_FROM_ENV__.trim() : "";
  return fromMeta || fromDefine;
}

function kstDayKey(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function kstMonthKey(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).format(d);
}

function parseVisitDate(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t) : null;
}

function aggregateByDay(visitRows, days) {
  const now = new Date();
  const keys = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * 86400000);
    keys.push(kstDayKey(d));
  }
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  visitRows.forEach((row) => {
    const d = parseVisitDate(row.visited_at);
    if (!d) return;
    const k = kstDayKey(d);
    if (counts[k] !== undefined) counts[k] += 1;
  });
  return keys.map((k) => ({
    label: k.slice(5).replace("-", "/"),
    full: k,
    count: counts[k],
  }));
}

function aggregateByMonth(visitRows, months) {
  const now = new Date();
  const keys = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(kstMonthKey(d));
  }
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  visitRows.forEach((row) => {
    const d = parseVisitDate(row.visited_at);
    if (!d) return;
    const k = kstMonthKey(d);
    if (counts[k] !== undefined) counts[k] += 1;
  });
  return keys.map((k) => ({
    label: k.replace("-", "년 ") + "월",
    full: k,
    count: counts[k],
  }));
}

function StatBars({ series, barMaxPx = 112 }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  return (
    <div className="flex min-h-[140px] items-end justify-between gap-1 overflow-x-auto pb-1 pt-2">
      {series.map((s) => (
        <div key={s.full} className="flex min-w-[1.75rem] flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-black text-indigo-600">{s.count}</span>
          <div className="flex w-full max-w-[2.25rem] flex-col items-center justify-end" style={{ height: barMaxPx }}>
            <div
              className="w-full min-h-[3px] rounded-t-lg bg-gradient-to-t from-indigo-700 to-indigo-400 shadow-sm transition-all"
              style={{ height: `${Math.max(4, (s.count / max) * 100)}%` }}
              title={`${s.full}: ${s.count}`}
            />
          </div>
          <span className="max-w-full truncate text-center text-[10px] font-bold leading-tight text-slate-500">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreDots({ value }) {
  const v = Math.round(Number(value)) || 0;
  return (
    <div className="flex shrink-0 gap-1" aria-label={`${v}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i <= v ? "bg-indigo-500 shadow-sm" : "bg-slate-200"}`} />
      ))}
    </div>
  );
}

function AnswersReportSection({ answers }) {
  const bySection = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      if (!map[q.section]) map[q.section] = [];
      map[q.section].push(q);
    });
    return map;
  }, []);

  if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
        저장된 문항 답변이 없습니다. (2차 저장 전 제출이거나 이전 스키마)
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">SECTION 01</p>
        <h3 className="mt-1 text-lg font-black">진단 문항 응답</h3>
        <p className="mt-1 text-xs text-slate-300">45문항 · 섹션별로 정리했습니다.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {Object.entries(bySection).map(([section, qs]) => (
          <div key={section} className="p-5">
            <h4 className="text-sm font-black text-slate-900">{section}</h4>
            <ul className="mt-4 space-y-4">
              {qs
                .filter((q) => {
                  const val = answers[String(q.id)] ?? answers[q.id];
                  return val != null && val !== "";
                })
                .map((q) => {
                  const val = answers[String(q.id)] ?? answers[q.id];
                  return (
                    <li key={q.id} className="rounded-2xl bg-slate-50/90 p-4 ring-1 ring-slate-100">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed text-slate-800">
                          <span className="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-indigo-600 ring-1 ring-indigo-100">
                            {q.id}
                          </span>
                          {q.text}
                        </p>
                        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                          <ScoreDots value={val} />
                          <span className="text-xs font-black text-indigo-700">{String(val)} / 5</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailedReportSection({ dr }) {
  if (!dr || typeof dr !== "object" || Object.keys(dr).length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
        베이직 리포트 JSON 이 비어 있습니다.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-900 to-violet-800 px-5 py-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">SECTION 02</p>
        <h3 className="mt-1 text-lg font-black">커리어 베이직 리포트</h3>
        {dr.createdAt ? <p className="mt-1 text-xs text-indigo-100">생성일 {dr.createdAt}</p> : null}
      </div>
      <div className="space-y-5 p-5">
        {dr.title ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">리포트 제목</p>
            <p className="mt-1 text-xl font-black text-slate-900">{dr.title}</p>
            {dr.code ? <p className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-800 ring-1 ring-indigo-100">흥미 코드 {dr.code}</p> : null}
          </div>
        ) : null}
        {dr.summary ? (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 ring-1 ring-slate-100">
            <p className="text-xs font-black text-indigo-700">한 줄 요약</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{dr.summary}</p>
          </div>
        ) : null}
        {dr.profileText ? (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">쉽게 보는 진로 성향</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{dr.profileText}</p>
          </div>
        ) : null}
        {dr.stage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-xs font-black text-emerald-800">준비 단계</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-emerald-950">{dr.stage}</p>
          </div>
        ) : null}
        {Array.isArray(dr.strengths) && dr.strengths.length > 0 ? (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">핵심 강점</p>
            <ul className="mt-3 space-y-2">
              {dr.strengths.map((t, i) => (
                <li key={`${i}-${t.slice(0, 24)}`} className="flex gap-3 rounded-2xl bg-white p-3 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-100">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {Array.isArray(dr.recommendedJobs) && dr.recommendedJobs.length > 0 ? (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">추천 직무</p>
            <ul className="mt-3 space-y-2">
              {dr.recommendedJobs.map((job, i) => {
                const title = typeof job === "string" ? job : job.title ?? "";
                const tip = typeof job === "object" && job.tip ? job.tip : null;
                return (
                  <li key={`${title}-${i}`} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm ring-1 ring-slate-800">
                    <span>{title}</span>
                    {tip ? <p className="mt-2 whitespace-pre-line font-normal leading-relaxed text-emerald-100/95">{tip}</p> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {Array.isArray(dr.actionPlan) && dr.actionPlan.length > 0 ? (
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">실행 전략</p>
            <ol className="mt-3 space-y-2">
              {dr.actionPlan.map((t, i) => (
                <li key={`ap-${i}`} className="flex gap-3 rounded-2xl bg-indigo-50/80 p-3 text-sm leading-relaxed text-indigo-950 ring-1 ring-indigo-100">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResultSummarySection({ result }) {
  if (!result || typeof result !== "object" || Object.keys(result).length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
        진단 결과 요약이 비어 있습니다.
      </section>
    );
  }

  const topR = Array.isArray(result.topRIASEC) ? result.topRIASEC : [];
  const topP = Array.isArray(result.topPersonality) ? result.topPersonality : [];
  const topA = Array.isArray(result.topAptitude) ? result.topAptitude : [];
  const jobs = Array.isArray(result.jobs) ? result.jobs : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-teal-800 px-5 py-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">SECTION 03</p>
        <h3 className="mt-1 text-lg font-black">진단 결과 요약</h3>
      </div>
      <div className="space-y-5 p-5">
        {result.summary ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-100">{result.summary}</p>
        ) : null}
        {result.level ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-400">준비 단계 라벨</p>
            <p className="mt-1 text-lg font-black text-slate-900">{result.level.label}</p>
            {result.level.desc ? <p className="mt-2 text-sm text-slate-600">{result.level.desc}</p> : null}
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-rose-50/80 p-4 ring-1 ring-rose-100">
            <p className="text-xs font-black text-rose-800">흥미유형 TOP</p>
            <ul className="mt-3 space-y-2">
              {topR.map(([k, sc], i) => (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">
                    {i + 1}. {riasecLabels[k]?.name || k}
                  </span>
                  <span className="font-black text-rose-700">{typeof sc === "number" ? sc.toFixed(1) : sc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-violet-50/80 p-4 ring-1 ring-violet-100">
            <p className="text-xs font-black text-violet-800">성격 TOP</p>
            <ul className="mt-3 space-y-2">
              {topP.map(([k, sc], i) => (
                <li key={k} className="text-sm leading-snug">
                  <span className="font-bold text-slate-800">
                    {i + 1}. {k}
                  </span>
                  <span className="ml-2 font-black text-violet-700">{typeof sc === "number" ? sc.toFixed(1) : sc}</span>
                  {personalityLabels[k] ? <p className="mt-1 text-xs text-slate-600">{personalityLabels[k]}</p> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-sky-50/80 p-4 ring-1 ring-sky-100">
            <p className="text-xs font-black text-sky-800">업무역량 TOP</p>
            <ul className="mt-3 space-y-2">
              {topA.map(([k, sc], i) => (
                <li key={k} className="text-sm leading-snug">
                  <span className="font-bold text-slate-800">
                    {i + 1}. {k}
                  </span>
                  <span className="ml-2 font-black text-sky-700">{typeof sc === "number" ? sc.toFixed(1) : sc}</span>
                  {aptitudeLabels[k] ? <p className="mt-1 text-xs text-slate-600">{aptitudeLabels[k]}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {jobs.length > 0 ? (
          <div>
            <p className="text-xs font-black text-slate-400">연계 추천 직무</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jobs.slice(0, 8).map((j) => (
                <span key={j} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 ring-1 ring-slate-200">
                  {j}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {typeof result.maturityAvg === "number" || typeof result.readinessAvg === "number" ? (
          <div className="flex flex-wrap gap-4 rounded-2xl bg-slate-900 p-4 text-white">
            {typeof result.maturityAvg === "number" ? (
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">성숙 평균</p>
                <p className="text-2xl font-black">{result.maturityAvg.toFixed(1)}</p>
              </div>
            ) : null}
            {typeof result.readinessAvg === "number" ? (
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">준비도 평균</p>
                <p className="text-2xl font-black">{result.readinessAvg.toFixed(1)}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FeedbackReportSection({ feedback }) {
  if (!feedback || typeof feedback !== "object") {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
        후기가 아직 없습니다.
      </section>
    );
  }

  const entries = Object.entries(FEEDBACK_LABELS)
    .map(([key, label]) => ({ key, label, value: feedback[key] }))
    .filter((e) => e.value != null && e.value !== "");

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
        후기 필드가 비어 있습니다.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-amber-800 to-orange-700 px-5 py-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">SECTION 04</p>
        <h3 className="mt-1 text-lg font-black">MVP 사용 후기</h3>
      </div>
      <dl className="grid gap-4 p-5 sm:grid-cols-2">
        {entries.map(({ key, label, value }) => (
          <div key={key} className={`rounded-2xl p-4 ring-1 ring-slate-100 ${String(value).length > 80 ? "sm:col-span-2" : ""}`}>
            <dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">{formatCell(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProfileStrip({ row }) {
  const fields = [
    ["이름", row.name],
    ["이메일", row.email],
    ["연락처", row.phone],
    ["연령대", row.age_group],
    ["상태", row.status],
    ["학력", row.education],
    ["학교", row.school],
    ["전공", row.major],
    ["학점", row.gpa],
    ["자격증", row.certificates],
    ["어학", row.language_scores],
    ["희망직무", row.target_job],
    ["희망기업", row.target_company_type],
    ["지역", row.region],
    ["유입", row.referral],
    ["개인정보 동의", row.privacy_consent],
    ["마케팅 동의", row.marketing_consent],
  ];

  return (
    <div className="border-b border-white/10 bg-white/5 px-6 py-6 backdrop-blur-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">참가자 프로필</p>
          <h3 className="mt-1 text-2xl font-black text-white">{row.name || "이름 미입력"}</h3>
          <p className="mt-2 text-sm text-slate-300">
            제출 시각 <span className="font-bold text-white">{formatCreatedAt(row.created_at)}</span>
          </p>
        </div>
        <p className="font-mono text-[10px] text-slate-500 lg:text-right">{row.id}</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map(([label, val]) => (
          <div key={label} className="rounded-xl bg-black/20 px-3 py-2 ring-1 ring-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{formatCell(val)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionReportCard({ row }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <ProfileStrip row={row} />
      </div>
      <div className="space-y-6 bg-gradient-to-b from-slate-50 to-white p-6">
        <AnswersReportSection answers={row.answers} />
        <DetailedReportSection dr={row.detailed_report} />
        <ResultSummarySection result={row.result} />
        <FeedbackReportSection feedback={row.feedback} />
      </div>
    </article>
  );
}

function VisitAnalyticsPanel({ visitRows, visitError }) {
  const [mode, setMode] = useState("daily");

  const dailySeries = useMemo(() => aggregateByDay(visitRows, 14), [visitRows]);
  const monthlySeries = useMemo(() => aggregateByMonth(visitRows, 12), [visitRows]);

  const todayKst = kstDayKey(new Date());
  const monthKst = kstMonthKey(new Date());

  const todayCount = useMemo(() => dailySeries.find((d) => d.full === todayKst)?.count ?? 0, [dailySeries, todayKst]);
  const monthCount = useMemo(() => monthlySeries.find((m) => m.full === monthKst)?.count ?? 0, [monthlySeries, monthKst]);
  const totalVisits = visitRows.length;

  if (visitError) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 ring-1 ring-amber-100">
        <p className="font-black">방문 통계를 불러오지 못했습니다.</p>
        <p className="mt-2 text-xs leading-relaxed opacity-90">{visitError}</p>
        <p className="mt-3 text-xs">
          Supabase SQL Editor에서 <code className="rounded bg-white px-1 py-0.5 font-mono">supabase/patch_site_visits.sql</code> 을 실행했는지 확인하세요.
        </p>
      </div>
    );
  }

  const series = mode === "daily" ? dailySeries : monthlySeries;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg ring-1 ring-slate-900/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">TRAFFIC</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">서비스 방문</h2>
          <p className="mt-1 text-sm text-slate-500">브라우저 세션당 1회 기록 · 한국 시간(KST) 기준 집계</p>
        </div>
        <div className="flex rounded-2xl bg-slate-100 p-1 ring-1 ring-slate-200/80">
          <button
            type="button"
            onClick={() => setMode("daily")}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${mode === "daily" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Daily · 14일
          </button>
          <button
            type="button"
            onClick={() => setMode("monthly")}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${mode === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Monthly · 12개월
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-md">
          <p className="text-xs font-bold text-indigo-100">오늘 (KST)</p>
          <p className="mt-2 text-4xl font-black tabular-nums">{todayCount}</p>
          <p className="mt-1 text-xs text-indigo-200">세션 수</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-md">
          <p className="text-xs font-bold text-slate-400">이번 달 (KST)</p>
          <p className="mt-2 text-4xl font-black tabular-nums">{monthCount}</p>
          <p className="mt-1 text-xs text-slate-400">세션 수</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500">표본 내 총 방문</p>
          <p className="mt-2 text-4xl font-black tabular-nums text-slate-900">{totalVisits}</p>
          <p className="mt-1 text-xs text-slate-500">최근 {visitRows.length ? Math.min(8000, visitRows.length) : 0}건 조회</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
        <p className="text-xs font-black text-slate-500">{mode === "daily" ? "일별 방문 (최근 14일)" : "월별 방문 (최근 12개월)"}</p>
        <StatBars series={series} />
      </div>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  const configuredKey = readConfiguredAdminKey();
  const [inputKey, setInputKey] = useState("");
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [rows, setRows] = useState([]);
  const [visitRows, setVisitRows] = useState([]);
  const [visitError, setVisitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setError("Supabase 클라이언트가 없습니다. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 확인하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setVisitError(null);

    const [subRes, visRes] = await Promise.all([
      supabase.from("diagnosis_submissions").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("site_visits").select("visited_at").order("visited_at", { ascending: false }).limit(8000),
    ]);

    if (subRes.error) {
      setError(subRes.error.message || String(subRes.error));
      setRows([]);
    } else {
      setRows(subRes.data || []);
    }

    if (visRes.error) {
      setVisitRows([]);
      setVisitError(visRes.error.message || String(visRes.error));
    } else {
      setVisitRows(visRes.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked && configuredKey) load();
  }, [unlocked, configuredKey, load]);

  const tryUnlock = (e) => {
    e.preventDefault();
    if (!configuredKey) return;
    if (inputKey === configuredKey) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      setInputKey("");
      setError(null);
    } else {
      setError("관리자 키가 일치하지 않습니다.");
    }
  };

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setRows([]);
    setVisitRows([]);
    setVisitError(null);
    setError(null);
  };

  if (!configuredKey) {
    const prod = import.meta.env.PROD;
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
          <h1 className="text-xl font-black">관리자 페이지 비활성</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">VITE_ADMIN_KEY</code> 가 이 빌드에 포함되어 있지 않습니다.
            {prod ? (
              <>
                {" "}
                <strong>Vercel</strong> → <strong>Settings → Environment Variables</strong>에{" "}
                <code className="rounded bg-slate-100 px-1.5 font-mono text-xs">VITE_ADMIN_KEY</code> 를 추가하고 <strong>Redeploy</strong>하세요.
              </>
            ) : (
              <>
                {" "}
                <code className="font-mono text-xs">.env.local</code> 에 추가한 뒤 dev 서버를 재시작하세요.
              </>
            )}
          </p>
          <a className="mt-6 inline-block text-sm font-bold text-indigo-600 hover:underline" href="#/">
            ← MVP 로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-md">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">Operations</p>
          <h1 className="mt-2 text-center text-3xl font-black tracking-tight">진단 제출 관리</h1>
          <p className="mt-3 text-center text-sm text-slate-400">관리자 키를 입력하세요.</p>
          <form onSubmit={tryUnlock} className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
            <input
              type="password"
              autoComplete="off"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-indigo-400/30 placeholder:text-slate-500 focus:ring-2"
              placeholder="VITE_ADMIN_KEY 와 동일한 값"
            />
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
            <button type="submit" className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-black text-slate-900 shadow-lg hover:bg-indigo-50">
              잠금 해제
            </button>
          </form>
          <a className="mt-8 block text-center text-sm font-bold text-indigo-300 hover:text-white" href="#/">
            ← MVP 로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-900">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-300">Career Diagnosis MVP</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">운영 콘솔</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">진단 제출 리포트와 서비스 방문 통계를 한 화면에서 확인합니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20 disabled:opacity-50"
            >
              {loading ? "불러오는 중…" : "데이터 새로고침"}
            </button>
            <button type="button" onClick={lock} className="rounded-2xl border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-sm font-bold text-rose-100 hover:bg-rose-500/30">
              잠금
            </button>
            <a className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-900 shadow-lg hover:bg-indigo-50" href="#/">
              MVP로
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <VisitAnalyticsPanel visitRows={visitRows} visitError={visitError} />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">{error}</div>
        ) : null}

        {!loading && rows.length === 0 && !error ? (
          <p className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">저장된 진단 제출이 없습니다.</p>
        ) : null}

        <div>
          <h2 className="mb-4 text-lg font-black text-slate-900">진단 제출 목록</h2>
          <p className="mb-6 text-sm text-slate-500">최신순 최대 300건 · 카드 형태의 리포트로 표시됩니다.</p>
          <div className="space-y-10">
            {rows.map((row) => (
              <SubmissionReportCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
