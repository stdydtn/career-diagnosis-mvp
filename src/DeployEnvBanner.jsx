import React from "react";
import { supabase } from "./lib/supabase.js";

/** Supabase URL/키가 번들에 없을 때 상단에 고정 표시 */
export default function DeployEnvBanner() {
  if (supabase) return null;

  const prod = import.meta.env.PROD;

  return (
    <div role="alert" className="relative z-[100] border-b border-red-800 bg-red-600 px-4 py-3 text-center text-sm font-bold leading-relaxed text-white shadow-md">
      {prod ? (
        <>
          <strong>Supabase에 연결되지 않았습니다.</strong> Vercel → 이 프로젝트 →{" "}
          <strong>Settings → Environment Variables</strong>에{" "}
          <code className="rounded bg-red-900/80 px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_URL</code> ·{" "}
          <code className="rounded bg-red-900/80 px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>를 추가하고{" "}
          <strong>Redeploy</strong>하세요. <code className="font-mono text-xs">career-diagnosis-mvp.vercel.app</code> 같은{" "}
          <strong>Preview</strong> URL만 쓰면 Preview 환경에도 같은 변수를 넣어야 합니다.
        </>
      ) : (
        <>
          Supabase 미연결: 프로젝트 루트 <code className="rounded bg-red-900/80 px-1.5 py-0.5 font-mono text-xs">.env.local</code>에{" "}
          <code className="font-mono text-xs">VITE_SUPABASE_URL</code>, <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>를 넣은 뒤{" "}
          <code className="font-mono text-xs">npm run dev</code>를 다시 실행하세요.
        </>
      )}
    </div>
  );
}
