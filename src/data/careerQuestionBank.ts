export type QuestionType = "multiple_choice" | "likert_5" | "situation_judgment";

export type CareerSection = "aptitude" | "situational" | "interest" | "values" | "workstyle" | "readiness";

export type CareerQuestionOption = {
  id: string;
  text: string;
  score?: number;
  scores?: Record<string, number>;
};

export type CareerQuestion = {
  id: string;
  section: CareerSection;
  subCategory: string;
  questionType: QuestionType;
  question: string;
  options?: CareerQuestionOption[];
  correctAnswerId?: string;
  weight?: number;
  difficulty?: "easy" | "medium" | "hard";
  tags: string[];
  explanation?: string;
};

const likertOptions: CareerQuestionOption[] = [
  { id: "1", text: "전혀 그렇지 않다", score: 1 },
  { id: "2", text: "그렇지 않은 편이다", score: 2 },
  { id: "3", text: "보통이다", score: 3 },
  { id: "4", text: "그런 편이다", score: 4 },
  { id: "5", text: "매우 그렇다", score: 5 },
];

export const careerQuestionBank: CareerQuestion[] = [
  // APTITUDE (12)
  {
    id: "APT_01",
    section: "aptitude",
    subCategory: "verbal",
    questionType: "multiple_choice",
    question: "다음 문장에서 핵심 의도에 가장 가까운 설명을 고르세요. '계획은 세웠지만 실행 우선순위를 정하지 못해 성과가 지연되었다.'",
    options: [
      { id: "a", text: "계획 자체가 완전히 잘못되었다." },
      { id: "b", text: "실행 순서 설정 부재가 지연의 주원인이다." },
      { id: "c", text: "팀원 수가 부족해 지연되었다." },
      { id: "d", text: "성과 목표를 너무 높게 잡았다." },
    ],
    correctAnswerId: "b",
    tags: ["verbal"],
    difficulty: "easy",
  },
  {
    id: "APT_02",
    section: "aptitude",
    subCategory: "verbal",
    questionType: "multiple_choice",
    question: "보고서 요약 원칙으로 가장 적절한 것은?",
    options: [
      { id: "a", text: "세부 사례를 최대한 많이 포함한다." },
      { id: "b", text: "결론보다 배경 설명을 길게 쓴다." },
      { id: "c", text: "핵심 결론과 근거를 먼저 제시한다." },
      { id: "d", text: "모든 문장을 같은 길이로 맞춘다." },
    ],
    correctAnswerId: "c",
    tags: ["verbal"],
    difficulty: "easy",
  },
  {
    id: "APT_03",
    section: "aptitude",
    subCategory: "verbal",
    questionType: "multiple_choice",
    question: "문장 관계가 가장 자연스러운 것은? '자료는 충분했다. ___ 결론은 성급했다.'",
    options: [
      { id: "a", text: "그래서" },
      { id: "b", text: "하지만" },
      { id: "c", text: "또한" },
      { id: "d", text: "따라서" },
    ],
    correctAnswerId: "b",
    tags: ["verbal"],
    difficulty: "easy",
  },
  {
    id: "APT_04",
    section: "aptitude",
    subCategory: "numerical",
    questionType: "multiple_choice",
    question: "A팀 지원자 수가 120명에서 150명으로 늘었다. 증가율은?",
    options: [
      { id: "a", text: "20%" },
      { id: "b", text: "25%" },
      { id: "c", text: "30%" },
      { id: "d", text: "35%" },
    ],
    correctAnswerId: "b",
    tags: ["numerical"],
    difficulty: "easy",
  },
  {
    id: "APT_05",
    section: "aptitude",
    subCategory: "numerical",
    questionType: "multiple_choice",
    question: "총 80개 업무 중 완료 56개, 진행 16개, 미착수 8개일 때 완료 비율은?",
    options: [
      { id: "a", text: "60%" },
      { id: "b", text: "65%" },
      { id: "c", text: "70%" },
      { id: "d", text: "75%" },
    ],
    correctAnswerId: "c",
    tags: ["numerical"],
    difficulty: "easy",
  },
  {
    id: "APT_06",
    section: "aptitude",
    subCategory: "numerical",
    questionType: "multiple_choice",
    question: "월별 처리건수(1월 40, 2월 50, 3월 60)의 평균은?",
    options: [
      { id: "a", text: "45" },
      { id: "b", text: "50" },
      { id: "c", text: "55" },
      { id: "d", text: "60" },
    ],
    correctAnswerId: "b",
    tags: ["numerical"],
    difficulty: "easy",
  },
  {
    id: "APT_07",
    section: "aptitude",
    subCategory: "dataInterpretation",
    questionType: "multiple_choice",
    question: "다음 중 '데이터 해석의 1차 목적'에 가장 가까운 것은?",
    options: [
      { id: "a", text: "원하는 결론을 정해 놓고 자료를 맞춘다." },
      { id: "b", text: "숫자를 나열해 분량을 늘린다." },
      { id: "c", text: "변화의 원인과 의미를 파악한다." },
      { id: "d", text: "단위와 기준을 생략해 간단히 만든다." },
    ],
    correctAnswerId: "c",
    tags: ["dataInterpretation"],
    difficulty: "medium",
  },
  {
    id: "APT_08",
    section: "aptitude",
    subCategory: "dataInterpretation",
    questionType: "multiple_choice",
    question: "매출은 증가했지만 이익이 감소했다. 우선 확인할 항목으로 가장 적절한 것은?",
    options: [
      { id: "a", text: "광고 문구 길이" },
      { id: "b", text: "원가와 할인율 변화" },
      { id: "c", text: "회의 참석 인원" },
      { id: "d", text: "보고서 폰트" },
    ],
    correctAnswerId: "b",
    tags: ["dataInterpretation"],
    difficulty: "medium",
  },
  {
    id: "APT_09",
    section: "aptitude",
    subCategory: "dataInterpretation",
    questionType: "multiple_choice",
    question: "A지표 10% 상승, B지표 5% 하락일 때 전체 성과 판단 전 필요한 조치는?",
    options: [
      { id: "a", text: "A만 보고 성공이라고 확정한다." },
      { id: "b", text: "B만 보고 실패라고 확정한다." },
      { id: "c", text: "두 지표의 중요도와 맥락을 함께 본다." },
      { id: "d", text: "수치를 반올림해 같다고 본다." },
    ],
    correctAnswerId: "c",
    tags: ["dataInterpretation"],
    difficulty: "medium",
  },
  {
    id: "APT_10",
    section: "aptitude",
    subCategory: "logicalReasoning",
    questionType: "multiple_choice",
    question: "모든 기획안은 검토를 거친다. 일부 검토안은 수정된다. 다음 중 참인 것은?",
    options: [
      { id: "a", text: "모든 기획안은 수정된다." },
      { id: "b", text: "일부 기획안은 수정될 수 있다." },
      { id: "c", text: "검토를 거치지 않은 기획안이 있다." },
      { id: "d", text: "수정안은 검토되지 않는다." },
    ],
    correctAnswerId: "b",
    tags: ["logicalReasoning"],
    difficulty: "medium",
  },
  {
    id: "APT_11",
    section: "aptitude",
    subCategory: "logicalReasoning",
    questionType: "multiple_choice",
    question: "조건: 보고서 제출 후에만 검토 시작. 검토 시작 후에만 배포 가능. 배포가 되었다면?",
    options: [
      { id: "a", text: "검토는 시작되지 않았다." },
      { id: "b", text: "제출은 없었을 수 있다." },
      { id: "c", text: "제출과 검토 시작이 모두 있었다." },
      { id: "d", text: "배포와 제출은 무관하다." },
    ],
    correctAnswerId: "c",
    tags: ["logicalReasoning"],
    difficulty: "medium",
  },
  {
    id: "APT_12",
    section: "aptitude",
    subCategory: "logicalReasoning",
    questionType: "multiple_choice",
    question: "프로젝트가 지연되면 A 또는 B를 수행한다. A를 수행하지 않았다면?",
    options: [
      { id: "a", text: "프로젝트는 지연되지 않았다." },
      { id: "b", text: "B를 수행했을 가능성이 있다." },
      { id: "c", text: "A와 B 모두 수행하지 않았다." },
      { id: "d", text: "B는 절대 수행할 수 없다." },
    ],
    correctAnswerId: "b",
    tags: ["logicalReasoning"],
    difficulty: "medium",
  },
  // SITUATIONAL (6)
  {
    id: "SJT_01",
    section: "situational",
    subCategory: "priority",
    questionType: "situation_judgment",
    question: "마감이 겹치는 두 업무가 동시에 들어왔습니다. 가장 적절한 대응은?",
    options: [
      { id: "a", text: "중요도·기한을 확인해 우선순위를 재정렬하고 공유한다.", score: 5 },
      { id: "b", text: "먼저 손에 잡히는 업무부터 한다.", score: 3 },
      { id: "c", text: "둘 다 미루고 다음날 다시 본다.", score: 1 },
      { id: "d", text: "한 업무만 끝까지 하고 다른 업무는 알리지 않는다.", score: 1 },
    ],
    tags: ["priority"],
  },
  {
    id: "SJT_02",
    section: "situational",
    subCategory: "collaboration",
    questionType: "situation_judgment",
    question: "협업 중 의견 충돌이 발생했습니다. 가장 적절한 대응은?",
    options: [
      { id: "a", text: "쟁점을 정리해 사실·근거 중심으로 합의안을 찾는다.", score: 5 },
      { id: "b", text: "상대 의견을 무조건 따른다.", score: 3 },
      { id: "c", text: "내 의견만 반복해서 주장한다.", score: 1 },
      { id: "d", text: "회의를 종료하고 연락을 끊는다.", score: 1 },
    ],
    tags: ["collaboration"],
  },
  {
    id: "SJT_03",
    section: "situational",
    subCategory: "ownership",
    questionType: "situation_judgment",
    question: "내 실수로 일정 지연이 생겼을 때 가장 적절한 행동은?",
    options: [
      { id: "a", text: "즉시 공유하고 복구 계획·재발방지안을 제시한다.", score: 5 },
      { id: "b", text: "조용히 수정해 본 뒤 나중에 알린다.", score: 3 },
      { id: "c", text: "다른 사람 책임으로 돌린다.", score: 1 },
      { id: "d", text: "문제가 사라지길 기다린다.", score: 1 },
    ],
    tags: ["ownership"],
  },
  {
    id: "SJT_04",
    section: "situational",
    subCategory: "reporting",
    questionType: "situation_judgment",
    question: "업무 진행 중 리스크를 발견했을 때 가장 적절한 행동은?",
    options: [
      { id: "a", text: "영향 범위와 대응안 초안을 함께 보고한다.", score: 5 },
      { id: "b", text: "혼자 해결 시도 후 실패하면 보고한다.", score: 3 },
      { id: "c", text: "문제가 확정될 때까지 숨긴다.", score: 1 },
      { id: "d", text: "동료에게만 말하고 공식 보고는 하지 않는다.", score: 1 },
    ],
    tags: ["reporting"],
  },
  {
    id: "SJT_05",
    section: "situational",
    subCategory: "customerFocus",
    questionType: "situation_judgment",
    question: "사용자 불편 신고가 들어왔을 때 우선 행동으로 가장 적절한 것은?",
    options: [
      { id: "a", text: "불편 맥락을 확인하고 즉시 가능한 대안을 안내한다.", score: 5 },
      { id: "b", text: "매뉴얼 문구만 복사해 전달한다.", score: 3 },
      { id: "c", text: "담당이 아니라고 답하고 종료한다.", score: 1 },
      { id: "d", text: "반응을 늦춰 자연히 해결되길 기다린다.", score: 1 },
    ],
    tags: ["customerFocus"],
  },
  {
    id: "SJT_06",
    section: "situational",
    subCategory: "ethics",
    questionType: "situation_judgment",
    question: "성과를 위해 규정 우회 제안을 받았을 때 가장 적절한 행동은?",
    options: [
      { id: "a", text: "규정 준수 원칙을 지키며 대체 방법을 찾는다.", score: 5 },
      { id: "b", text: "짧은 기간만 우회하자고 제안한다.", score: 3 },
      { id: "c", text: "들키지 않으면 진행한다.", score: 1 },
      { id: "d", text: "아무 기록 없이 구두로만 처리한다.", score: 1 },
    ],
    tags: ["ethics"],
  },
  // INTEREST (10)
  ...[
    ["INT_01", "analytical", "데이터를 비교·분석해 의미를 찾는 일이 재미있다."],
    ["INT_02", "practical", "현장에서 직접 실행하며 문제를 푸는 일이 잘 맞는다."],
    ["INT_03", "creative", "새로운 아이디어나 콘텐츠를 기획하는 일이 즐겁다."],
    ["INT_04", "social", "다른 사람의 성장을 돕는 활동에 보람을 느낀다."],
    ["INT_05", "enterprising", "목표를 세우고 사람들을 이끄는 역할이 좋다."],
    ["INT_06", "conventional", "절차·문서·일정을 체계적으로 관리하는 일이 편하다."],
    ["INT_07", "analytical", "복잡한 정보를 구조화해 설명하는 일을 선호한다."],
    ["INT_08", "creative", "기존 방식보다 새로운 방식으로 개선하는 데 흥미가 있다."],
    ["INT_09", "social", "상담·교육·안내처럼 대면 커뮤니케이션 역할이 맞는다."],
    ["INT_10", "enterprising", "성과 지표를 보고 실행 전략을 조정하는 일이 재미있다."],
  ].map(([id, subCategory, question]) => ({
    id,
    section: "interest" as const,
    subCategory,
    questionType: "likert_5" as const,
    question,
    options: likertOptions,
    tags: [subCategory],
  })),
  // VALUES (8)
  ...[
    ["VAL_01", "stability", "직업 선택에서 안정적인 제도와 운영을 중요하게 생각한다."],
    ["VAL_02", "growth", "짧은 성과보다 장기적인 성장 가능성을 더 중시한다."],
    ["VAL_03", "autonomy", "업무 방식에 자율권이 있는 환경을 선호한다."],
    ["VAL_04", "recognition", "성과가 명확히 인정되는 문화를 중요하게 본다."],
    ["VAL_05", "relationship", "함께 일하는 사람들과의 신뢰 관계를 중요하게 본다."],
    ["VAL_06", "impact", "내 일이 사용자·사회에 긍정적 영향을 주는지 중요하다."],
    ["VAL_07", "workLifeBalance", "지속 가능한 업무 강도와 균형을 중요하게 본다."],
    ["VAL_08", "challenge", "새로운 도전 과제가 주어지는 환경을 선호한다."],
  ].map(([id, subCategory, question]) => ({
    id,
    section: "values" as const,
    subCategory,
    questionType: "likert_5" as const,
    question,
    options: likertOptions,
    tags: [subCategory],
  })),
  // WORKSTYLE (10)
  ...[
    ["WST_01", "conscientiousness", "마감과 약속을 지키기 위해 미리 계획을 세운다."],
    ["WST_02", "initiative", "지시를 기다리기보다 먼저 과제를 제안하는 편이다."],
    ["WST_03", "collaboration", "의견이 달라도 공통 목표를 기준으로 협력한다."],
    ["WST_04", "emotionalStability", "압박 상황에서도 감정을 비교적 안정적으로 유지한다."],
    ["WST_05", "learningAgility", "낯선 도구나 업무를 빠르게 익히는 편이다."],
    ["WST_06", "detailOrientation", "작은 오류나 누락을 점검하는 편이다."],
    ["WST_07", "flexibility", "상황 변화가 생겨도 유연하게 계획을 조정한다."],
    ["WST_08", "execution", "결정한 일은 끝까지 실행해 결과를 만든다."],
    ["WST_09", "resourceManagement", "시간·예산·인력을 고려해 효율적으로 일한다."],
    ["WST_10", "workEthic", "성과보다도 기본 원칙과 윤리를 지키는 편이다."],
  ].map(([id, subCategory, question]) => ({
    id,
    section: "workstyle" as const,
    subCategory,
    questionType: "likert_5" as const,
    question,
    options: likertOptions,
    tags: [subCategory],
  })),
  // READINESS (6)
  ...[
    ["RDY_01", "selfUnderstanding", "내 강점·약점을 직무 관점에서 설명할 수 있다."],
    ["RDY_02", "jobUnderstanding", "희망 직무의 주요 업무와 역량을 설명할 수 있다."],
    ["RDY_03", "companyResearch", "지원 기업의 사업/서비스를 조사해 비교해본 경험이 있다."],
    ["RDY_04", "experienceStructuring", "경험을 상황-행동-결과 구조로 정리해 두었다."],
    ["RDY_05", "resumeReadiness", "자기소개서·이력서의 기본 버전을 갖추고 있다."],
    ["RDY_06", "interviewReadiness", "면접 예상 질문에 대한 답변을 연습해본 경험이 있다."],
  ].map(([id, subCategory, question]) => ({
    id,
    section: "readiness" as const,
    subCategory,
    questionType: "likert_5" as const,
    question,
    options: likertOptions,
    tags: [subCategory],
  })),
];

export const sectionMeta: Record<CareerSection, { title: string; count: number }> = {
  aptitude: { title: "직무기초 사고력 진단", count: 12 },
  situational: { title: "문제해결·상황판단 진단", count: 6 },
  interest: { title: "직무흥미 진단", count: 10 },
  values: { title: "직업가치관 진단", count: 8 },
  workstyle: { title: "업무성향 진단", count: 10 },
  readiness: { title: "취업준비도 진단", count: 6 },
};

