import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase.js";

const SESSION_KEY = "mvp_diagnosis_admin_unlock";

/**
 * 제출 데이터 조회 전용 화면입니다.
 * 접속: 주소창에 #/admin (예: http://localhost:5173/#/admin)
 * .env.local 에 VITE_ADMIN_KEY 를 두고, 아래에서 동일한 값으로 잠금 해제하세요.
 *
 * 주의: anon 키로 읽으므로 Supabase RLS 가 익명 SELECT 를 허용하는 경우에만 동작합니다.
 * 배포 시에는 관리자 전용 백엔드 또는 Supabase Auth + 제한적 RLS 로 옮기는 것을 권장합니다.
 */

function JsonBlock({ title, value }) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <details className="group rounded-2xl border border-slate-200 bg-slate-50/80">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-black text-slate-800 marker:text-slate-400 group-open:border-b group-open:border-slate-200">
        {title}
      </summary>
      <pre className="max-h-[min(70vh,520px)] overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-slate-700">{text}</pre>
    </details>
  );
}

function formatCell(v) {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "예" : "아니오";
  return String(v);
}

/** DB 가 KST 벽시각(naive) 또는 timestamptz ISO 일 때 모두 읽기 쉽게 */
function formatCreatedAt(value) {
  if (value == null || value === "") return "—";
  const raw = typeof value === "string" ? value.trim() : String(value);
  if (!raw) return "—";
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(raw);
  if (hasZone) {
    return new Date(raw).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  }
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  return `${normalized.replace("T", " ")} (KST)`;
}

function readConfiguredAdminKey() {
  const fromMeta =
    typeof import.meta.env.VITE_ADMIN_KEY === "string" ? import.meta.env.VITE_ADMIN_KEY.trim() : "";
  const fromDefine = typeof __VITE_ADMIN_KEY_FROM_ENV__ === "string" ? __VITE_ADMIN_KEY_FROM_ENV__.trim() : "";
  return fromMeta || fromDefine;
}

export default function AdminSubmissionsPage() {
  const configuredKey = readConfiguredAdminKey();
  const [inputKey, setInputKey] = useState("");
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setError("Supabase 클라이언트가 없습니다. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 확인하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("diagnosis_submissions").select("*").order("created_at", { ascending: false }).limit(300);
    if (fetchError) {
      setError(fetchError.message || String(fetchError));
      setRows([]);
    } else {
      setRows(data || []);
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
    setError(null);
  };

  if (!configuredKey) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-black">관리자 페이지 비활성</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">VITE_ADMIN_KEY</code> 가 비어 있습니다. 프로젝트 루트의 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code> 에 한 줄로 추가하고 파일을 저장한 뒤, 터미널에서 dev 서버를 완전히 종료했다가 <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run dev</code> 로 다시 띄우세요. 값에 특수문자가 있으면 따옴표로 감싸면 안전합니다. 예:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">VITE_ADMIN_KEY=&quot;내_비밀문자열&quot;</code>
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
      <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-black">진단 제출 관리</h1>
          <p className="mt-2 text-sm text-slate-600">관리자 키를 입력하세요.</p>
          <form onSubmit={tryUnlock} className="mt-6 space-y-4">
            <input
              type="password"
              autoComplete="off"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-slate-900/10 focus:ring-2"
              placeholder="VITE_ADMIN_KEY 와 동일한 값"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-black text-white shadow-sm hover:bg-slate-800">
              잠금 해제
            </button>
          </form>
          <a className="mt-6 inline-block text-sm font-bold text-indigo-600 hover:underline" href="#/">
            ← MVP 로 돌아가기
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">진단 제출 목록</h1>
            <p className="mt-1 text-sm text-slate-600">최신순 최대 300건 · Table Editor 보다 JSON 전체를 편하게 볼 수 있습니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => load()} disabled={loading} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50">
              {loading ? "불러오는 중…" : "새로고침"}
            </button>
            <button type="button" onClick={lock} className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 shadow-sm hover:bg-red-50">
              잠금
            </button>
            <a className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-slate-800" href="#/">
              MVP
            </a>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        {!loading && rows.length === 0 && !error ? (
          <p className="rounded-3xl bg-white p-8 text-center text-slate-600 ring-1 ring-slate-200">저장된 행이 없습니다.</p>
        ) : null}

        <ul className="space-y-6">
          {rows.map((row) => (
            <li key={row.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-slate-500">{row.id}</span>
                  <time className="text-sm font-bold text-slate-800">{formatCreatedAt(row.created_at)}</time>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {[
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
                    ["희망기업유형", row.target_company_type],
                    ["지역", row.region],
                    ["유입경로", row.referral],
                    ["개인정보 동의", row.privacy_consent],
                    ["마케팅 동의", row.marketing_consent],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-0.5 font-medium text-slate-800">{formatCell(val)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-3 p-5">
                <JsonBlock title="문항 답변 (answers)" value={row.answers} />
                <JsonBlock title="상세 리포트 (detailed_report)" value={row.detailed_report} />
                <JsonBlock title="진단 결과 요약 (result)" value={row.result} />
                <JsonBlock title="후기 (feedback)" value={row.feedback} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
