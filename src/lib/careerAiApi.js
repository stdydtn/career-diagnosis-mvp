/**
 * GPT 연동은 `/api/career-ai`(Vercel 서버리스)만 호출합니다. API 키는 브라우저에 두지 마세요.
 * 로컬에서 AI 테스트: 프로젝트 루트에서 `npx vercel dev` 후 동일 저장소에서 실행합니다.
 */

export async function callCareerAi(action, payload) {
  const res = await fetch("/api/career-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ action, payload }),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok || !body.ok) {
    const msg = body.message || body.error || `요청 실패 (${res.status})`;
    throw new Error(msg);
  }

  return body.data;
}
