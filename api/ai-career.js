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
너는 취업진로 코칭 전문가다.
아래 검사 결과는 시스템이 코드로 계산한 결과다.
점수를 임의로 변경하거나 새로 계산하지 말고, 제공된 결과를 바탕으로 해석만 작성하라.

주의사항:
- 특정 기업의 공식 인적성검사 결과처럼 표현하지 말 것
- 합격 가능성을 단정하지 말 것
- 사용자를 낙인찍는 표현을 쓰지 말 것
- "위험군" 대신 "보완 필요 영역", "집중 관리가 필요한 영역"으로 표현할 것
- 결과는 진로/취업 준비 참고자료임을 안내할 것

[사용자 기본정보]
${JSON.stringify(profile, null, 2)}

[검사 결과 JSON]
${JSON.stringify(result, null, 2)}

다음 JSON 형식으로만 답변하세요.

{
  "interpretation": "종합 진단 요약",
  "tips": ["강점 활용 팁 1", "보완 팁 2", "다음 액션 3"]
}
`;
  }

  if (mode === "report") {
    return `
너는 취업진로 코칭 전문가다.
아래 검사 결과는 시스템이 코드로 계산한 결과다.
점수를 임의로 변경하거나 새로 계산하지 말고, 제공된 결과를 바탕으로 리포트만 작성하라.

주의사항:
- 특정 기업의 공식 인적성검사처럼 표현하지 말 것
- 합격/불합격 가능성을 단정하지 말 것
- 낙인 표현을 피하고 친절하고 현실적인 톤으로 작성할 것

[사용자 기본정보]
${JSON.stringify(profile, null, 2)}

[진단 결과]
${JSON.stringify(result, null, 2)}

[후기조사]
${JSON.stringify(feedback, null, 2)}

다음 JSON 형식으로만 답변하세요.

{
  "title": "리포트 제목",
  "summary": "종합 진단 요약",
  "careerInterpretation": "대표 커리어 유형 + 해석",
  "strengths": ["강점 역량 TOP 3 설명"],
  "improvements": ["보완 필요 영역 TOP 3 설명"],
  "recommendedJobs": ["추천 직무군 TOP 5"],
  "recommendedCompanyTypes": ["추천 기업유형"],
  "selfIntroPoints": ["자기소개서 어필 포인트"],
  "interviewDirections": ["면접 답변 방향"],
  "actionPlan": ["앞으로 4주 준비 전략 4개"]
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
