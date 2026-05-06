/**
 * Vercel Serverless: OpenAI 호출 전용 (OPENAI_API_KEY는 서버 환경 변수만 사용)
 * 로컬: `vercel dev` 실행 시 /api/career-ai 동작. `npm run dev`만으로는 /api 미제공.
 */

const MAX_BODY_CHARS = 48_000;

function clip(str, max = 12_000) {
  if (typeof str !== "string") return "";
  return str.length <= max ? str : `${str.slice(0, max)}…(생략)`;
}

async function openaiChatJson(messages, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY_MISSING");
    err.code = "OPENAI_API_KEY_MISSING";
    throw err;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.55,
      max_tokens: options.max_tokens ?? 2200,
      response_format: { type: "json_object" },
    }),
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const err = new Error(`OpenAI 응답 파싱 실패: ${res.status}`);
    err.code = "OPENAI_PARSE";
    throw err;
  }

  if (!res.ok) {
    const msg = data?.error?.message || raw.slice(0, 400);
    const err = new Error(msg || `OpenAI 오류 ${res.status}`);
    err.code = "OPENAI_HTTP";
    throw err;
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    const err = new Error("OpenAI 응답 본문이 비어 있습니다.");
    err.code = "OPENAI_EMPTY";
    throw err;
  }

  try {
    return JSON.parse(content);
  } catch {
    const err = new Error("모델이 JSON 형식으로 답하지 않았습니다.");
    err.code = "OPENAI_JSON";
    throw err;
  }
}

function parseBody(req) {
  if (req.body != null && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }
  return {};
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function readJsonBody(req) {
  const first = parseBody(req);
  if (first && typeof first === "object" && Object.keys(first).length > 0) {
    return first;
  }
  try {
    const raw = await readRawBody(req);
    const trimmed = (raw || "").trim();
    if (!trimmed) return {};
    return JSON.parse(trimmed);
  } catch {
    return {};
  }
}

async function handleDiagnosisInsight(payload) {
  const system = `당신은 한국 취업 준비생을 돕는 진로 상담 코치입니다.
사용자의 자가진단 요약(점수·유형)을 바탕으로, 어려운 용어 없이 따뜻하고 실용적인 톤으로 해설하세요.
반드시 아래 JSON 스키마로만 답하세요 (한국어):
{"interpretation":"3~5문단 분량의 해설(문단 구분은 \\n\\n)","tips":["실천 팁 1","실천 팁 2","실천 팁 3"]}`;

  const user = JSON.stringify(payload, null, 0);
  return openaiChatJson(
    [
      { role: "system", content: system },
      { role: "user", content: `다음 진단 결과를 해설해 주세요.\n${user}` },
    ],
    { max_tokens: 1800 },
  );
}

async function handleCoverLetter(payload) {
  const system = `당신은 한국 자기소개서 첨삭 전문가입니다.
지원 회사·직무 맥락에 맞춰 구체적으로 피드백하세요. 과장·허위 내용은 요구하지 마세요.
반드시 아래 JSON 스키마로만 답하세요 (한국어):
{"overallFeedback":"전체 총평","strengths":["좋은 점"],"improvements":["보완 포인트"],"revisedSample":"지원자 말투를 유지한 수정 예시 문단(짧게)"}`;

  const safe = {
    company: clip(payload.company, 200),
    job: clip(payload.job, 200),
    question: clip(payload.question, 2000),
    answer: clip(payload.answer, 12_000),
    ruleBasedHint: payload.ruleBasedHint ? clip(String(payload.ruleBasedHint), 4000) : "",
    diagnosisHint: payload.diagnosisHint ? clip(String(payload.diagnosisHint), 2000) : "",
  };

  const user = JSON.stringify(safe, null, 0);
  return openaiChatJson(
    [
      { role: "system", content: system },
      { role: "user", content: `자기소개서 문항과 답변을 첨삭해 주세요.\n${user}` },
    ],
    { max_tokens: 2400 },
  );
}

async function handleReportCoach(payload) {
  const system = `당신은 한국 취업 준비생을 위한 커리어 리포트 코치입니다.
이미 작성된 베이직 리포트 요약을 바탕으로, 서류·면접 준비에 바로 쓸 수 있는 코칭을 덧붙이세요.
어려운 약어는 쓰지 마세요.
반드시 아래 JSON 스키마로만 답하세요 (한국어):
{"openingReflection":"인사말처럼 짧게 동기 부여","emphasisForApplications":["지원 시 강조할 포인트 1","2","3"],"oneWeekFocus":"이번 주에 할 일 한 단락"}`;

  const condensed = {
    title: clip(payload.title, 500),
    summary: clip(payload.summary, 2500),
    stage: clip(payload.stage, 3500),
    strengths: Array.isArray(payload.strengths) ? payload.strengths.map((s) => clip(String(s), 800)).slice(0, 6) : [],
    actionPlan: Array.isArray(payload.actionPlan) ? payload.actionPlan.map((s) => clip(String(s), 600)).slice(0, 8) : [],
    participant: payload.participant || {},
  };

  const user = JSON.stringify(condensed, null, 0);
  return openaiChatJson(
    [
      { role: "system", content: system },
      { role: "user", content: `아래 베이직 리포트를 보완하는 코칭을 작성해 주세요.\n${user}` },
    ],
    { max_tokens: 1600 },
  );
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
    return;
  }

  let body = await readJsonBody(req);
  let rawLen = 0;
  try {
    rawLen = JSON.stringify(body).length;
  } catch {
    rawLen = MAX_BODY_CHARS + 1;
  }
  if (rawLen > MAX_BODY_CHARS) {
    res.status(413).json({ ok: false, error: "PAYLOAD_TOO_LARGE" });
    return;
  }

  const action = body.action;
  const payload = body.payload;

  if (!action || typeof action !== "string") {
    res.status(400).json({ ok: false, error: "INVALID_ACTION" });
    return;
  }

  try {
    let result;
    if (action === "diagnosis_insight") {
      result = await handleDiagnosisInsight(payload || {});
    } else if (action === "cover_letter") {
      result = await handleCoverLetter(payload || {});
    } else if (action === "report_coach") {
      result = await handleReportCoach(payload || {});
    } else {
      res.status(400).json({ ok: false, error: "UNKNOWN_ACTION" });
      return;
    }
    res.status(200).json({ ok: true, data: result });
  } catch (e) {
    const code = e.code || "INTERNAL";
    if (code === "OPENAI_API_KEY_MISSING") {
      res.status(503).json({
        ok: false,
        error: code,
        message: "서버에 OPENAI_API_KEY가 설정되지 않았습니다. Vercel 환경 변수를 확인하세요.",
      });
      return;
    }
    res.status(500).json({
      ok: false,
      error: code,
      message: e.message || String(e),
    });
  }
}
