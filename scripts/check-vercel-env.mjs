#!/usr/bin/env node
/**
 * Vercel 빌드 시에만 실행: Supabase용 VITE_* 가 process.env 에 없으면 실패합니다.
 * (Settings → Environment Variables 에 넣었는지, Production/Preview 체크 여부 확인)
 */
if (!process.env.VERCEL) {
  process.exit(0);
}

const url = (process.env.VITE_SUPABASE_URL || "").trim();
const key = (process.env.VITE_SUPABASE_ANON_KEY || "").trim();

if (!url || !key) {
  console.error("\n[x] Vercel 빌드 실패: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 가 비어 있습니다.");
  console.error("   1) Vercel → 해당 프로젝트 → Settings → Environment Variables");
  console.error("   2) 이름은 정확히 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (앞에 VITE_ 필수)");
  console.error("   3) 값은 Supabase Dashboard → Settings → API 의 Project URL / anon public key");
  console.error("   4) Environment 에 Production 과 Preview(미리보기 URL 사용 시) 모두 체크");
  console.error("   5) 저장 후 Deployments → … → Redeploy\n");
  process.exit(1);
}

if (!/^https:\/\/.+\.supabase\.co\/?$/i.test(url)) {
  console.warn("[!] VITE_SUPABASE_URL 형식이 일반적인 Supabase URL과 다릅니다. 예: https://xxxx.supabase.co (끝 슬래시 없음 권장)");
}
if (key.length < 80) {
  console.warn("[!] VITE_SUPABASE_ANON_KEY 가 짧습니다. anon public JWT 전체를 붙여넣었는지 확인하세요.");
}

console.log("[ok] Vercel 빌드: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 감지됨.");
