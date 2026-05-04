import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase.js";

/**
 * 클라이언트는 생겼는데 테이블/RLS/네트워크 문제로 API 가 막힐 때 안내
 */
export default function SupabaseDbHealthBanner() {
  const [state, setState] = useState({ phase: "idle", detail: "" });

  useEffect(() => {
    if (!supabase) {
      setState({ phase: "skip", detail: "" });
      return;
    }
    setState({ phase: "loading", detail: "" });

    let cancelled = false;

    supabase
      .from("diagnosis_submissions")
      .select("id")
      .limit(1)
      .then(({ error }) => {
        if (cancelled) return;
        if (error) {
          const parts = [error.message, error.hint, error.code].filter(Boolean);
          setState({ phase: "error", detail: parts.join(" · ") });
        } else {
          setState({ phase: "ok", detail: "" });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ phase: "error", detail: err?.message || String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.phase === "skip" || state.phase === "idle" || state.phase === "loading" || state.phase === "ok") {
    return null;
  }

  return (
    <div role="status" className="relative z-[99] border-b border-amber-700 bg-amber-400 px-4 py-3 text-center text-sm font-bold leading-relaxed text-amber-950 shadow-sm">
      Supabase URL/키는 번들에 있지만, <strong>diagnosis_submissions</strong> 테이블에 접근하지 못했습니다. SQL Editor에서{" "}
      <code className="rounded bg-amber-600/40 px-1 font-mono text-xs">supabase/schema.sql</code> 또는{" "}
      <code className="rounded bg-amber-600/40 px-1 font-mono text-xs">patch_anon_select.sql</code>·
      <code className="rounded bg-amber-600/40 px-1 font-mono text-xs">patch_answers_and_update.sql</code> 실행 여부와{" "}
      <strong>프로젝트 URL이 이 DB와 같은지</strong> 확인하세요.
      {state.detail ? <span className="mt-2 block font-mono text-xs font-semibold opacity-90">{state.detail}</span> : null}
    </div>
  );
}
