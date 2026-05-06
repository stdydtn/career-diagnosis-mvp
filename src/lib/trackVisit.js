import { supabase } from "./supabase.js";

const SESSION_FLAG = "mvp_site_visit_v1";

/** 메인 서비스 세션당 1회 방문 로그 (관리자 통계용) */
export function trackSiteVisitOnce() {
  if (!supabase || typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    return;
  }
  supabase.from("site_visits").insert({}).then(({ error }) => {
    if (error) console.warn("[site_visits]", error.message);
  });
}
