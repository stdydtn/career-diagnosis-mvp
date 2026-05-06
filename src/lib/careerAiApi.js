/**
 * GPT 연동은 `/api/ai-career`(Vercel 서버리스)만 호출합니다. API 키는 브라우저에 두지 마세요.
 * 로컬에서 AI 테스트: 프로젝트 루트에서 `npx vercel dev` 후 동일 저장소에서 실행합니다.
 */

export function buildReportCoachPayload(report) {
  if (!report || typeof report !== "object") return null;
  return {
    title: report.title,
    summary: report.summary,
    stage: report.stage,
    strengths: report.strengths,
    actionPlan: report.actionPlan,
    participant: report.participant,
  };
}

/**
 * 후기 제출 등 저장 전에 호출. 실패해도 예외를 던지지 않고 aiCoachError만 채웁니다.
 */
export async function fetchReportCoachSafe(report) {
  try {
    const payload = buildReportCoachPayload(report);
    if (!payload) {
      return { aiCoach: null, aiCoachError: null, aiCoachGeneratedAt: null };
    }
    const data = await callCareerAi("report_coach", payload);
    return {
      aiCoach: data,
      aiCoachError: null,
      aiCoachGeneratedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      aiCoach: null,
      aiCoachError: err.message || String(err),
      aiCoachGeneratedAt: null,
    };
  }
}

export async function callCareerAi(action, payload) {
  const requestBody = buildAiCareerRequest(action, payload);
  const res = await fetch("/api/ai-career", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(requestBody),
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok || body.success === false) {
    const msg = body.message || body.error || `요청 실패 (${res.status})`;
    throw new Error(msg);
  }

  if (body.data != null) return body.data;
  if (body.raw != null) {
    throw new Error("AI 응답이 JSON 형식이 아닙니다. 잠시 후 다시 시도해 주세요.");
  }
  throw new Error("AI 응답 데이터가 비어 있습니다.");
}

function buildAiCareerRequest(action, payload) {
  if (action === "diagnosis_insight") {
    return {
      mode: "diagnosis",
      profile: payload?.profile || {},
      answers: payload?.answers || {},
      result: payload || {},
    };
  }
  if (action === "report_coach") {
    return {
      mode: "report",
      profile: payload?.participant || {},
      result: payload || {},
      feedback: payload?.feedback || {},
    };
  }
  if (action === "cover_letter") {
    return {
      mode: "coverLetter",
      profile: payload?.profile || {},
      result: payload?.result || {},
      coverLetter: payload || {},
    };
  }
  return {
    mode: String(action || ""),
    result: payload || {},
  };
}
