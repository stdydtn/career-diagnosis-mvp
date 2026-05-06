import { careerQuestionBank, sectionMeta, type CareerQuestion, type CareerSection } from "../data/careerQuestionBank";

export type RecommendedJobGroup = {
  name: string;
  score: number;
  reasons: string[];
  suggestedPreparation: string[];
};

export type RecommendedCompanyType = {
  name: string;
  score: number;
  reasons: string[];
};

export type CareerAssessmentResult = {
  rawScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  sectionScores: Record<CareerSection, number>;
  topStrengths: string[];
  improvementAreas: string[];
  interestProfile: Record<string, number>;
  valueProfile: Record<string, number>;
  workstyleProfile: Record<string, number>;
  readinessProfile: Record<string, number>;
  recommendedJobGroups: RecommendedJobGroup[];
  recommendedCompanyTypes: RecommendedCompanyType[];
  representativeCareerType: string;
  selfIntroPoints: string[];
  interviewDirections: string[];
  fourWeekPlan: string[];
  summary: string;
};

type AnswersMap = Record<string, string | number>;

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0 / values.length);
}

function sectionQuestions(section: CareerSection) {
  return careerQuestionBank.filter((q) => q.section === section);
}

function profileFromLikert(section: CareerSection, answers: AnswersMap) {
  const grouped: Record<string, number[]> = {};
  sectionQuestions(section).forEach((q) => {
    const raw = answers[q.id];
    const picked = q.options?.find((o) => o.id === String(raw));
    const score = Number(picked?.score ?? raw ?? 0);
    if (!grouped[q.subCategory]) grouped[q.subCategory] = [];
    if (score > 0) grouped[q.subCategory].push(score);
  });
  return Object.fromEntries(Object.entries(grouped).map(([k, values]) => [k, clamp100((values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)) * 20)]));
}

function aptitudeScore(answers: AnswersMap) {
  const qs = sectionQuestions("aptitude");
  let correct = 0;
  const raw: Record<string, number> = { verbal: 0, numerical: 0, dataInterpretation: 0, logicalReasoning: 0 };
  qs.forEach((q) => {
    const isCorrect = String(answers[q.id] ?? "") === q.correctAnswerId;
    if (isCorrect) {
      correct += 1;
      raw[q.subCategory] = (raw[q.subCategory] || 0) + 1;
    }
  });
  return {
    score: clamp100((correct / qs.length) * 100),
    raw,
    normalized: {
      verbal: clamp100((raw.verbal / 3) * 100),
      numerical: clamp100((raw.numerical / 3) * 100),
      dataInterpretation: clamp100((raw.dataInterpretation / 3) * 100),
      logicalReasoning: clamp100((raw.logicalReasoning / 3) * 100),
    },
  };
}

function situationalScore(answers: AnswersMap) {
  const qs = sectionQuestions("situational");
  let total = 0;
  const byCat: Record<string, number> = {};
  qs.forEach((q) => {
    const picked = q.options?.find((o) => o.id === String(answers[q.id]));
    const sc = Number(picked?.score ?? 0);
    total += sc;
    byCat[q.subCategory] = sc;
  });
  return {
    score: clamp100((total / (qs.length * 5)) * 100),
    raw: byCat,
  };
}

function scoreJobGroups(input: {
  aptitude: ReturnType<typeof aptitudeScore>;
  situational: ReturnType<typeof situationalScore>;
  interest: Record<string, number>;
  values: Record<string, number>;
  workstyle: Record<string, number>;
  readiness: Record<string, number>;
}) {
  const a = input.aptitude.normalized;
  const s = input.situational.raw;
  const i = input.interest;
  const v = input.values;
  const w = input.workstyle;
  const r = input.readiness;

  const groups: RecommendedJobGroup[] = [
    {
      name: "기획/사업관리",
      score: clamp100((a.verbal + a.dataInterpretation + (s.priority || 0) * 20 + (i.conventional || 0) + (w.execution || 0) + (r.companyResearch || 0)) / 6),
      reasons: ["자료해석과 우선순위 판단 점수가 반영됩니다.", "운영·실행형 성향이 높을수록 유리합니다."],
      suggestedPreparation: ["채용공고 5개를 비교해 공통 역량 키워드 정리", "기획안 1개를 문제-해결-성과 구조로 작성"],
    },
    {
      name: "인사/교육",
      score: clamp100((a.verbal + (i.social || 0) + (w.collaboration || 0) + (v.relationship || 0) + (r.selfUnderstanding || 0) + (r.interviewReadiness || 0)) / 6),
      reasons: ["상담·교육형 흥미와 협업성이 높습니다.", "관계 가치와 자기이해가 반영됩니다."],
      suggestedPreparation: ["코칭/멘토링 경험을 상황-행동-결과로 정리", "면접 답변에서 공감·조율 사례 준비"],
    },
    {
      name: "마케팅/브랜딩",
      score: clamp100(((i.creative || 0) + a.verbal + a.dataInterpretation + (v.autonomy || 0) + (v.recognition || 0) + (w.execution || 0)) / 6),
      reasons: ["창의성/실행력과 언어·자료 해석이 조합됩니다.", "자율·인정 가치가 반영됩니다."],
      suggestedPreparation: ["콘텐츠 기획안 1개와 성과 지표 정리", "브랜드 분석 리포트 1개 작성"],
    },
    {
      name: "데이터/분석",
      score: clamp100((a.numerical + a.dataInterpretation + a.logicalReasoning + (i.analytical || 0) + (w.learningAgility || 0)) / 5),
      reasons: ["수리논리·추리·분석 흥미 비중이 큽니다.", "학습민첩성이 반영됩니다."],
      suggestedPreparation: ["간단한 데이터 프로젝트 1개 완성", "문제정의-분석-인사이트 흐름으로 포트폴리오 구성"],
    },
    {
      name: "영업관리",
      score: clamp100((a.dataInterpretation + (i.enterprising || 0) + (v.relationship || 0) + (w.initiative || 0) + (s.customerFocus || 0) * 20) / 5),
      reasons: ["사업형 흥미와 주도성이 반영됩니다.", "고객 관점 상황판단 점수가 반영됩니다."],
      suggestedPreparation: ["성과 사례를 수치 중심으로 3개 정리", "고객 대응 시나리오 질문 대비"],
    },
    {
      name: "공공행정",
      score: clamp100((a.verbal + (i.conventional || 0) + (v.stability || 0) + (w.workEthic || 0) + (w.detailOrientation || 0)) / 5),
      reasons: ["안정·윤리·정확성 성향이 반영됩니다.", "언어이해와 관리형 흥미를 봅니다."],
      suggestedPreparation: ["정책/행정 이슈 요약 노트 작성", "문서작성·절차 준수 사례 준비"],
    },
    {
      name: "생산/품질/물류",
      score: clamp100((a.numerical + (i.practical || 0) + (w.detailOrientation || 0) + (w.resourceManagement || 0) + (s.ownership || 0) * 20) / 5),
      reasons: ["현장형 흥미와 꼼꼼함/자원관리 성향을 반영합니다.", "책임감 상황판단 점수가 반영됩니다."],
      suggestedPreparation: ["공정 개선 사례를 전후 비교로 정리", "품질·납기·원가 관점 문제해결 경험 정리"],
    },
    {
      name: "IT/서비스기획",
      score: clamp100((a.logicalReasoning + (s.customerFocus || 0) * 20 + (w.learningAgility || 0) + (i.creative || 0) + a.dataInterpretation) / 5),
      reasons: ["논리추리·자료해석과 사용자 관점 판단을 반영합니다.", "학습민첩성과 창의성을 함께 봅니다."],
      suggestedPreparation: ["서비스 개선안 1개를 사용자 흐름 중심으로 정리", "요구사항-우선순위-성과지표 연결 연습"],
    },
  ];
  return groups.sort((x, y) => y.score - x.score).slice(0, 5);
}

function scoreCompanyTypes(input: {
  aptitude: ReturnType<typeof aptitudeScore>;
  interest: Record<string, number>;
  values: Record<string, number>;
  workstyle: Record<string, number>;
}) {
  const a = input.aptitude.normalized;
  const i = input.interest;
  const v = input.values;
  const w = input.workstyle;

  const items: RecommendedCompanyType[] = [
    { name: "대기업", score: clamp100(((v.compensation || 60) + (v.recognition || 0) + (i.enterprising || 0) + (w.execution || 0)) / 4), reasons: ["보상/인정 가치와 성과지향 성향이 반영됩니다."] },
    { name: "공기업/공공기관", score: clamp100(((v.stability || 0) + (w.workEthic || 0) + (i.conventional || 0) + (w.detailOrientation || 0)) / 4), reasons: ["안정성·윤리·정확성 성향이 반영됩니다."] },
    { name: "중견기업", score: clamp100(((w.execution || 0) + (w.flexibility || 0) + (i.enterprising || 0) + (v.growth || 0)) / 4), reasons: ["실행력과 유연성이 균형형으로 반영됩니다."] },
    { name: "스타트업", score: clamp100(((v.challenge || 0) + (v.growth || 0) + (w.initiative || 0) + (w.learningAgility || 0)) / 4), reasons: ["도전·성장·주도성 성향이 반영됩니다."] },
    { name: "연구/전문직무 조직", score: clamp100((a.numerical + a.dataInterpretation + a.logicalReasoning + (i.analytical || 0) + (v.expertise || 60)) / 5), reasons: ["분석역량·전문성 지향이 반영됩니다."] },
    { name: "교육/상담/서비스 조직", score: clamp100((a.verbal + (i.social || 0) + (v.relationship || 0) + (w.collaboration || 0)) / 4), reasons: ["상담/협업/관계 중심 성향이 반영됩니다."] },
  ];
  return items.sort((x, y) => y.score - x.score).slice(0, 3);
}

export function computeCareerAssessment(answers: AnswersMap): CareerAssessmentResult {
  const aptitude = aptitudeScore(answers);
  const situational = situationalScore(answers);
  const interest = profileFromLikert("interest", answers);
  const values = profileFromLikert("values", answers);
  const workstyle = profileFromLikert("workstyle", answers);
  const readiness = profileFromLikert("readiness", answers);

  const sectionScores: Record<CareerSection, number> = {
    aptitude: aptitude.score,
    situational: situational.score,
    interest: clamp100(Object.values(interest).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(interest).length)),
    values: clamp100(Object.values(values).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(values).length)),
    workstyle: clamp100(Object.values(workstyle).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(workstyle).length)),
    readiness: clamp100(Object.values(readiness).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(readiness).length)),
  };

  const weightedTotal = clamp100(
    sectionScores.aptitude * 0.3 +
      sectionScores.situational * 0.15 +
      sectionScores.interest * 0.2 +
      sectionScores.values * 0.15 +
      sectionScores.workstyle * 0.15 +
      sectionScores.readiness * 0.05,
  );

  const profilePairs = [
    ...Object.entries(aptitude.normalized),
    ...Object.entries(interest),
    ...Object.entries(values),
    ...Object.entries(workstyle),
    ...Object.entries(readiness),
  ].sort((a, b) => b[1] - a[1]);
  const topStrengths = profilePairs.slice(0, 3).map(([k]) => k);
  const improvementAreas = profilePairs.slice(-3).map(([k]) => k);

  const jobs = scoreJobGroups({ aptitude, situational, interest, values, workstyle, readiness });
  const companies = scoreCompanyTypes({ aptitude, interest, values, workstyle });
  const representativeCareerType = jobs[0]?.name ? `${jobs[0].name} 적합형` : "균형 성장형";

  return {
    rawScores: { ...aptitude.raw, ...situational.raw },
    normalizedScores: { ...aptitude.normalized, ...interest, ...values, ...workstyle, ...readiness },
    sectionScores,
    topStrengths,
    improvementAreas,
    interestProfile: interest,
    valueProfile: values,
    workstyleProfile: workstyle,
    readinessProfile: readiness,
    recommendedJobGroups: jobs,
    recommendedCompanyTypes: companies,
    representativeCareerType,
    selfIntroPoints: topStrengths.map((k) => `${k} 기반 경험을 상황-행동-결과 구조로 1개씩 준비하세요.`),
    interviewDirections: [
      "직무 선택 이유를 경험 근거와 연결해 30초/1분 버전으로 준비하세요.",
      "보완 영역은 개선 계획 중심으로 설명하세요.",
      "추천 직무군 기준으로 성과 수치를 1개 이상 포함하세요.",
    ],
    fourWeekPlan: [
      "1주차: 희망 직무군 공고 10개 분석, 공통 역량 키워드 추출",
      "2주차: 경험 3개를 상황-행동-결과 구조로 재정리",
      "3주차: 자기소개서 핵심 문항 2개 개선 및 피드백 반영",
      "4주차: 모의면접 2회 및 답변 로그 기반 보완",
    ],
    summary: `대기업·공공기관 직무기초역량과 직업상담 진단 요소를 참고한 자체 커리어진단 결과, 종합 준비도는 ${weightedTotal}점입니다.`,
  };
}

export function buildQuestionPages() {
  const order: CareerSection[] = ["aptitude", "situational", "interest", "values", "workstyle", "readiness"];
  const pages = order.flatMap((section) => {
    const qs = sectionQuestions(section);
    return qs.map((q, idx) => ({
      section,
      sectionTitle: sectionMeta[section].title,
      sectionIndex: idx + 1,
      sectionTotal: qs.length,
      question: q,
    }));
  });
  return pages;
}

export function questionCount() {
  return careerQuestionBank.length;
}

