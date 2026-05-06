import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { mode, profile, answers, result, coverLetter, feedback } = req.body || {};

    if (!mode) {
      return res.status(400).json({ error: "mode is required" });
    }

    const prompt = buildPrompt({
      mode,
      profile,
      answers,
      result,
      coverLetter,
      feedback,
    });

    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions:
        "당신은 대학생, 취업준비생, 이직준비자를 돕는 진로·취업 전문 컨설턴트입니다. 과도한 단정은 피하고, 사용자가 이해하기 쉬운 한국어로 답변하세요. 결과는 반드시 JSON만 반환하세요.",
      input: prompt,
    });

    const text = response.output_text;
    const parsed = safeJsonParse(text);

    if (!parsed) {
      return res.status(200).json({
        success: true,
        raw: text,
      });
    }

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("AI API Error:", error);
    return res.status(500).json({
      error: "AI 처리 중 오류가 발생했습니다.",
    });
  }
}

function buildPrompt({ mode, profile, answers, result, coverLetter, feedback }) {
  if (mode === "diagnosis") {
    return `
아래 사용자의 진단 데이터를 바탕으로 AI 커리어 진단 결과를 생성하세요.

[사용자 기본정보]
${JSON.stringify(profile, null, 2)}

[진단 응답]
${JSON.stringify(answers, null, 2)}

[기존 계산 결과]
${JSON.stringify(result, null, 2)}

다음 JSON 형식으로만 답변하세요.

{
  "careerSummary": "사용자가 이해하기 쉬운 커리어 요약",
  "mainStrengths": ["핵심 강점 1", "핵심 강점 2", "핵심 강점 3"],
  "recommendedJobs": ["추천 직무 1", "추천 직무 2", "추천 직무 3", "추천 직무 4", "추천 직무 5"],
  "preparationStage": {
    "label": "탐색 우선형 또는 방향 설정형 또는 실행 강화형",
    "description": "쉬운 설명"
  },
  "nextActions": ["실행전략 1", "실행전략 2", "실행전략 3", "실행전략 4"]
}
`;
  }

  if (mode === "report") {
    return `
아래 데이터를 바탕으로 베이직 상세 리포트를 작성하세요.

[사용자 기본정보]
${JSON.stringify(profile, null, 2)}

[진단 결과]
${JSON.stringify(result, null, 2)}

[후기조사]
${JSON.stringify(feedback, null, 2)}

전문용어를 줄이고, 일반 사용자가 이해하기 쉬운 문장으로 작성하세요.
"RIA형", "SEC형" 같은 코드 중심 표현은 사용하지 마세요.

다음 JSON 형식으로만 답변하세요.

{
  "title": "쉬운 표현의 리포트 제목",
  "summary": "상단 요약 문장",
  "careerInterpretation": "쉽게 보는 진로 성향 설명",
  "strengths": ["구체적인 강점 1", "구체적인 강점 2", "구체적인 강점 3"],
  "recommendedJobs": ["추천 직무 1", "추천 직무 2", "추천 직무 3", "추천 직무 4", "추천 직무 5"],
  "actionPlan": ["실행전략 1", "실행전략 2", "실행전략 3", "실행전략 4"]
}
`;
  }

  if (mode === "coverLetter") {
    return `
아래 사용자의 진단 결과와 자기소개서 입력 내용을 바탕으로 자기소개서 첨삭을 해주세요.

[사용자 기본정보]
${JSON.stringify(profile, null, 2)}

[진단 결과]
${JSON.stringify(result, null, 2)}

[자기소개서]
${JSON.stringify(coverLetter, null, 2)}

첨삭은 단순 맞춤법 교정이 아니라 직무연결성, 경험구체성, 성과근거, 회사맞춤도 중심으로 해주세요.
각 문항별로 구체적으로 피드백하세요.

다음 JSON 형식으로만 답변하세요.

{
  "overallComment": "전체 총평",
  "averageScore": 0,
  "items": [
    {
      "questionNo": 1,
      "score": 0,
      "scores": {
        "문항적합도": 0,
        "직무연결성": 0,
        "경험구체성": 0,
        "성과근거": 0,
        "회사맞춤도": 0
      },
      "strengths": ["좋은 점 1", "좋은 점 2"],
      "improvements": ["보완점 1", "보완점 2"],
      "diagnosisBasedAdvice": "진단 결과 기반 맞춤 조언",
      "recommendedStructure": ["구조 1", "구조 2", "구조 3"],
      "sampleRevision": "수정 예시 문장"
    }
  ]
}
`;
  }

  return `
mode 값이 올바르지 않습니다.
JSON으로 {"error":"invalid mode"}만 반환하세요.
`;
}
