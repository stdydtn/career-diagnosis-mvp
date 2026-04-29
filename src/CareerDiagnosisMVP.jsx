import React, { useMemo, useRef, useState } from "react";

const SERVICE_NAME = "AI 커리어 프로파일 진단 MVP";
const TABS = ["커리어 진단", "유료 상품 구성", "베이직 리포트", "자기소개서 첨삭"];
const LIKERT_OPTIONS = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아니다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "그렇다" },
  { value: 5, label: "매우 그렇다" },
];

const INTEREST_DESCRIPTIONS = {
  R: "도구, 기계, 현장, 실물 중심의 활동을 선호합니다.",
  I: "분석, 연구, 문제해결, 지식 탐구 활동을 선호합니다.",
  A: "창의, 표현, 콘텐츠, 자유로운 방식의 활동을 선호합니다.",
  S: "교육, 상담, 코칭, 타인의 성장을 돕는 활동을 선호합니다.",
  E: "설득, 리더십, 성과창출, 프로젝트 추진 활동을 선호합니다.",
  C: "문서, 절차, 데이터, 체계적 관리 업무를 선호합니다.",
};

const PERSONALITY_DESCRIPTIONS = {
  외향성: "사람과의 상호작용과 대외활동에서 에너지를 얻는 경향",
  성실성: "목표, 일정, 책임, 기준을 꾸준히 지키는 경향",
  개방성: "새로운 아이디어와 변화에 열려 있는 경향",
  친화성: "타인을 배려하고 협력적 관계를 만드는 경향",
  정서안정성: "압박 상황에서도 안정적으로 대응하는 경향",
};

const APTITUDE_DESCRIPTIONS = {
  언어이해: "글과 말의 핵심을 파악하고 정리하는 역량",
  수리논리: "숫자, 자료, 구조를 논리적으로 해석하는 역량",
  문제해결: "상황의 원인을 찾고 대안을 설계하는 역량",
  대인설명: "상대방이 이해하기 쉽게 설명하고 설득하는 역량",
  실행관리: "계획을 세우고 절차에 맞춰 완수하는 역량",
};

const JOB_MAP = {
  S: ["진로·취업 컨설턴트", "HRD·교육기획", "상담·코칭", "고객성공관리", "사회복지·공공서비스"],
  E: ["영업관리", "사업개발", "프로젝트 매니저", "창업·스타트업", "마케팅 기획"],
  C: ["공공기관 행정", "총무·운영관리", "회계·재무지원", "사업관리", "품질·문서관리"],
  I: ["데이터 분석", "전략기획", "연구개발", "정책분석", "IT기획"],
  A: ["콘텐츠 기획", "브랜딩", "UX기획", "디자인", "홍보·SNS마케팅"],
  R: ["생산관리", "설비·시설관리", "기술영업", "건설·안전관리", "제조현장관리"],
};

const DIAGNOSIS_SECTIONS = [
  {
    key: "interest",
    title: "흥미검사",
    questions: [
      { id: 1, text: "기계, 도구, 장비를 직접 다루는 활동에 흥미가 있다.", trait: "R" },
      { id: 2, text: "현장에서 직접 움직이며 문제를 해결하는 일이 잘 맞는다.", trait: "R" },
      { id: 3, text: "문제를 분석하고 원인을 찾는 과정이 흥미롭다.", trait: "I" },
      { id: 4, text: "자료를 조사하고 근거를 바탕으로 판단하는 일을 좋아한다.", trait: "I" },
      { id: 5, text: "글쓰기, 디자인, 콘텐츠 제작처럼 표현하는 활동에 흥미가 있다.", trait: "A" },
      { id: 6, text: "정해진 방식보다 나만의 방식으로 일하는 것을 선호한다.", trait: "A" },
      { id: 7, text: "사람을 돕거나 상담하는 일에 보람을 느낀다.", trait: "S" },
      { id: 8, text: "교육, 코칭, 멘토링 활동에 관심이 있다.", trait: "S" },
      { id: 9, text: "사람을 설득하거나 이끄는 역할에 자신이 있다.", trait: "E" },
      { id: 10, text: "새로운 사업이나 프로젝트를 추진하는 데 흥미가 있다.", trait: "E" },
      { id: 11, text: "문서, 일정, 절차를 체계적으로 관리하는 일이 잘 맞는다.", trait: "C" },
      { id: 12, text: "정확성, 규칙, 기준을 지키는 업무가 편하다.", trait: "C" },
    ],
  },
  {
    key: "personality",
    title: "성격검사",
    questions: [
      { id: 13, text: "새로운 사람을 만나고 대화하는 과정에서 에너지를 얻는다.", trait: "외향성" },
      { id: 14, text: "발표나 대외활동처럼 사람 앞에 서는 상황이 비교적 편하다.", trait: "외향성" },
      { id: 15, text: "맡은 일을 끝까지 책임지고 완수하려는 편이다.", trait: "성실성" },
      { id: 16, text: "일정, 기준, 마감기한을 지키는 것을 중요하게 생각한다.", trait: "성실성" },
      { id: 17, text: "새로운 방식이나 아이디어를 시도하는 데 거부감이 적다.", trait: "개방성" },
      { id: 18, text: "변화가 있는 환경에서 새로운 가능성을 찾는 편이다.", trait: "개방성" },
      { id: 19, text: "타인의 입장을 고려하며 협력적으로 일하는 편이다.", trait: "친화성" },
      { id: 20, text: "갈등 상황에서도 관계를 해치지 않도록 조율하려고 한다.", trait: "친화성" },
      { id: 21, text: "압박감이 있는 상황에서도 비교적 침착하게 대응한다.", trait: "정서안정성" },
      { id: 22, text: "예상치 못한 문제가 생겨도 쉽게 무너지지 않고 대안을 찾는다.", trait: "정서안정성" },
    ],
  },
  {
    key: "aptitude",
    title: "적성 자가진단",
    questions: [
      { id: 23, text: "글이나 자료를 읽고 핵심 내용을 빠르게 정리하는 편이다.", trait: "언어이해" },
      { id: 24, text: "복잡한 내용을 상대방이 이해하기 쉽게 문장으로 풀어낼 수 있다.", trait: "언어이해" },
      { id: 25, text: "숫자, 표, 그래프를 보고 의미를 파악하는 일이 어렵지 않다.", trait: "수리논리" },
      { id: 26, text: "자료를 비교하고 논리적으로 결론을 내리는 편이다.", trait: "수리논리" },
      { id: 27, text: "문제가 생기면 원인을 나누어 보고 해결순서를 정하는 편이다.", trait: "문제해결" },
      { id: 28, text: "기존 방식보다 더 나은 대안을 찾아보려는 편이다.", trait: "문제해결" },
      { id: 29, text: "상대방의 수준에 맞게 설명하거나 설득하는 일이 비교적 자신 있다.", trait: "대인설명" },
      { id: 30, text: "사람의 고민을 듣고 필요한 방향을 정리해주는 편이다.", trait: "대인설명" },
      { id: 31, text: "해야 할 일을 목록화하고 우선순위를 정해 처리하는 편이다.", trait: "실행관리" },
      { id: 32, text: "여러 업무가 동시에 있어도 일정과 자료를 정리하며 진행할 수 있다.", trait: "실행관리" },
    ],
  },
  {
    key: "maturity",
    title: "진로성숙도검사",
    questions: [
      { id: 33, text: "내 강점과 약점을 어느 정도 구체적으로 설명할 수 있다.", trait: "자기이해" },
      { id: 34, text: "관심 직무가 실제로 어떤 일을 하는지 조사해본 적이 있다.", trait: "직업정보" },
      { id: 35, text: "직업을 선택할 때 나에게 중요한 기준이 분명하다.", trait: "의사결정" },
      { id: 36, text: "희망 직무를 위해 어떤 준비를 해야 하는지 계획을 세워본 적이 있다.", trait: "계획성" },
      { id: 37, text: "최근 1개월 내 취업이나 진로를 위해 실제 행동을 한 적이 있다.", trait: "준비행동" },
    ],
  },
  {
    key: "readiness",
    title: "경력준비도검사",
    questions: [
      { id: 38, text: "프로젝트, 인턴, 아르바이트, 대외활동 경험을 직무별로 정리해두었다.", trait: "경험정리" },
      { id: 39, text: "내 경험에서 성과나 기여도를 수치 또는 사례로 설명할 수 있다.", trait: "성과정리" },
      { id: 40, text: "내 경험이 어떤 직무역량과 연결되는지 설명할 수 있다.", trait: "직무매칭" },
      { id: 41, text: "희망 직무에 맞는 이력서나 자기소개서를 준비하고 있다.", trait: "지원준비" },
      { id: 42, text: "나의 경험을 면접 답변으로 말할 수 있도록 연습해본 적이 있다.", trait: "면접준비" },
    ],
  },
];

const PRICING_PRODUCTS = [
  { title: "무료 진단", price: "0원", target: "신규 유입용", desc: "간단한 커리어 진단을 통해 흥미, 강점, 준비도를 확인하는 무료 상품입니다.", cta: "무료 진단 시작하기" },
  { title: "베이직 리포트", price: "9,900원", target: "상세 결과 확인용", desc: "검사 결과를 상세 리포트로 제공하고 추천 직무와 취업준비 우선순위를 정리합니다.", cta: "상세 리포트 구매" },
  { title: "자소서 첨삭 패키지", price: "39,000원", target: "자기소개서 보완용", desc: "진단 결과를 바탕으로 자기소개서의 강점 표현과 직무 연결성을 보완합니다.", cta: "자소서 첨삭 신청" },
  { title: "1:1 커리어 코칭", price: "150,000원", target: "전략 설계용", desc: "직무선택, 경험 정리, 자기소개서, 면접 준비까지 연결합니다.", cta: "1:1 코칭 예약" },
  { title: "기관형 라이선스", price: "별도 견적", target: "대학·기관용", desc: "단체 진단과 결과 대시보드를 제공합니다.", cta: "기관 도입 문의" },
];

const COVER_LETTER_QUESTIONS = [1, 2, 3, 4];
const ACTION_KEYWORDS = ["기획", "분석", "조사", "운영", "관리", "제안", "실행", "협업", "조율", "개선", "작성", "발표", "상담", "도입", "설계"];
const RESULT_KEYWORDS = ["성과", "결과", "개선", "달성", "증가", "감소", "해결", "완료", "수상", "선정", "기여", "합격", "향상"];
const MOTIVE_KEYWORDS = ["지원", "직무", "회사", "기업", "역량", "경험", "가치", "목표", "성장", "입사"];

const clamp = (num, min, max) => Math.max(min, Math.min(max, num));
const average = (arr = []) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const toTopEntries = (mapObj, n = 3) =>
  Object.entries(mapObj || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

function countKeywordHits(text = "", words = []) {
  return words.reduce((acc, w) => (text.includes(w) ? acc + 1 : acc), 0);
}

function calculateReadinessStage(maturityAvg, readinessAvg) {
  if (maturityAvg < 3.2) {
    return {
      label: "탐색 우선형",
      desc: "직업 선택 기준과 자기이해를 먼저 정리해야 하는 단계입니다.",
    };
  }
  if (maturityAvg >= 3.2 && readinessAvg < 3.3) {
    return {
      label: "방향 설정형",
      desc: "관심 직무는 어느 정도 잡혔으나 경험 정리와 지원 준비가 더 필요한 단계입니다.",
    };
  }
  return {
    label: "실행 강화형",
    desc: "진로 방향과 준비행동이 비교적 갖춰져 있어 실전 지원 전략을 고도화할 단계입니다.",
  };
}

function createRecommendedJobs(topRiasec = []) {
  const set = [];
  topRiasec.forEach(([code]) => {
    (JOB_MAP[code] || []).forEach((job) => {
      if (!set.includes(job)) set.push(job);
    });
  });
  return set.slice(0, 10);
}

function analyzeCoverLetter(answer = "", company = "", role = "", diagnosisData) {
  const text = answer || "";
  const actionHits = countKeywordHits(text, ACTION_KEYWORDS);
  const resultHits = countKeywordHits(text, RESULT_KEYWORDS);
  const motiveHits = countKeywordHits(text, MOTIVE_KEYWORDS);
  const hasCompany = company ? text.includes(company) : false;
  const hasRole = role ? text.includes(role) || text.includes("직무") : false;
  const hasNumbers = /\d+|%|명|건|회|개월|년|점|만원|등급/.test(text);
  const length = text.length;

  const scores = {
    문항적합도: clamp(45 + motiveHits * 10 + (hasRole ? 10 : 0), 30, 100),
    직무연결성: clamp(40 + (hasRole ? 20 : 0) + motiveHits * 8, 30, 100),
    경험구체성: clamp(35 + actionHits * 10 + (length > 500 ? 10 : 0), 30, 100),
    성과근거: clamp(30 + resultHits * 12 + (hasNumbers ? 12 : 0), 30, 100),
    회사맞춤도: clamp(30 + (hasCompany ? 25 : 0) + motiveHits * 6, 30, 100),
  };
  const total = Math.round(average(Object.values(scores)));

  const strengths = [];
  const improvements = [];

  if (actionHits > 1) strengths.push("경험에서 수행한 행동이 어느 정도 드러납니다.");
  if (resultHits > 0 || hasNumbers) strengths.push("성과나 결과를 설명할 수 있는 단서가 포함되어 있습니다.");
  if (hasRole) strengths.push("지원 직무와의 연결성이 일부 반영되어 있습니다.");
  if (hasCompany) strengths.push("지원 회사 맞춤 표현이 포함되어 있습니다.");
  if (!strengths.length) strengths.push("핵심 경험이 담겨 있어 첨삭 기반을 만들기 좋습니다.");

  if (actionHits < 2) improvements.push("내가 실제로 한 행동을 구체적인 동사로 보완하세요.");
  if (resultHits < 1 && !hasNumbers) improvements.push("성과, 변화, 배운 점을 결과 문장으로 보완하세요.");
  if (!hasRole) improvements.push("지원 직무명 또는 직무역량을 직접 언급해 직무 적합도를 높이세요.");
  if (!hasCompany) improvements.push("회사명, 사업방향, 고객, 서비스와 연결되는 문장을 1개 이상 추가하세요.");
  if (length > 0 && length < 500) improvements.push("분량이 짧아 경험의 맥락과 결과가 약해 보일 수 있습니다. 최소 500자 이상으로 확장해보세요.");
  if (length > 1200) improvements.push("분량이 길어 핵심이 흐려질 수 있습니다. 한 경험 중심으로 압축하세요.");

  const diagnosisGuide =
    diagnosisData?.isCompleted && diagnosisData?.topInterest?.length
      ? [
          `흥미유형 ${diagnosisData.topInterest[0]?.[0] || "-"} 기준으로 강점이 드러나는 경험을 앞쪽에 배치하세요.`,
          `성격 강점 ${diagnosisData.topPersonality?.[0]?.[0] || "-"} 기준으로 실제 행동 사례를 강화하세요.`,
          `적성 강점 ${diagnosisData.topAptitude?.[0]?.[0] || "-"} 기준으로 문제 해결 과정과 결과를 연결하세요.`,
        ]
      : ["커리어 진단을 완료하면 흥미유형, 성격, 적성 결과를 반영한 맞춤 첨삭이 활성화됩니다."];

  return {
    total,
    scores,
    strengths,
    improvements,
    diagnosisGuide,
    structure: "문제/목표 -> 행동/역할 -> 성과/수치 -> 지원직무 연결 -> 입사 후 기여",
    rewrittenSample: "OO 프로젝트에서 고객 이탈률 12% 문제를 확인하고 데이터 분석을 통해 원인을 세분화했습니다. 이후 운영 프로세스를 재설계해 2개월 내 이탈률을 8%로 개선했으며, 이 경험을 바탕으로 귀사의 " + (role || "직무") + "에서 지표 기반 실행력을 기여하겠습니다.",
  };
}

function ScoreBar({ label, score }) {
  const pct = clamp(Math.round((score / 5) * 100), 0, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>{label}</span>
        <span>{score.toFixed(2)} / 5</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DiagnosisPage({ activeSection, setActiveSection, answers, setAnswers, diagnosisResult, onResetAll, onGoTab }) {
  const sectionRefs = useRef({});
  const allQuestions = useMemo(() => DIAGNOSIS_SECTIONS.flatMap((s) => s.questions), []);
  const completedCount = useMemo(() => Object.keys(answers || {}).length, [answers]);
  const isCompleted = completedCount === allQuestions.length;

  const sectionCompleted = (section) => section.questions.every((q) => answers?.[q.id]);
  const currentSection = DIAGNOSIS_SECTIONS[activeSection] || DIAGNOSIS_SECTIONS[0];

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function goToNext() {
    const nextIndex = activeSection + 1;
    if (nextIndex < DIAGNOSIS_SECTIONS.length) {
      setActiveSection(nextIndex);
      const target = sectionRefs.current?.[DIAGNOSIS_SECTIONS[nextIndex].key];
      if (target?.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">통합 커리어 진단 (42문항)</h2>
          <div className="text-sm text-slate-600">진행률: {completedCount}/42</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          {DIAGNOSIS_SECTIONS.map((s, idx) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSection(idx)}
              className={`rounded-2xl px-3 py-2 text-sm ${
                idx === activeSection ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div ref={(el) => (sectionRefs.current[currentSection.key] = el)} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">{currentSection.title}</h3>
        <div className="mt-4 space-y-4">
          {currentSection.questions.map((q) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm text-slate-800">{q.id}. {q.text}</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {LIKERT_OPTIONS.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setAnswer(q.id, op.value)}
                    className={`rounded-xl px-2 py-2 text-xs ${
                      answers?.[q.id] === op.value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {op.value}점 {op.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!sectionCompleted(currentSection)}
            onClick={goToNext}
            className={`rounded-2xl px-4 py-2 ${
              sectionCompleted(currentSection) ? "bg-slate-900 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            다음 단계로 이동
          </button>
          <button type="button" onClick={onResetAll} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">
            초기화
          </button>
        </div>
      </div>

      {isCompleted && diagnosisResult && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">진단 결과 리포트</h3>
          <p className="mt-2 text-sm text-slate-700">{diagnosisResult.summary}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">흥미유형 TOP 3</h4>
              {diagnosisResult.topInterest.map(([k, v]) => <ScoreBar key={k} label={`${k} 유형`} score={v} />)}
              <p className="text-sm text-slate-600">{INTEREST_DESCRIPTIONS[diagnosisResult.topInterest?.[0]?.[0]] || ""}</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">성격 강점 TOP 3</h4>
              {diagnosisResult.topPersonality.map(([k, v]) => <ScoreBar key={k} label={k} score={v} />)}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">적성 강점 TOP 3</h4>
              {diagnosisResult.topAptitude.map(([k, v]) => <ScoreBar key={k} label={k} score={v} />)}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">진로·취업 준비 단계</h4>
              <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-semibold">{diagnosisResult.stage.label}</p>
                <p>{diagnosisResult.stage.desc}</p>
              </div>
              <h4 className="font-medium text-slate-900">추천 직무 TOP 10</h4>
              <div className="flex flex-wrap gap-2">
                {diagnosisResult.recommendedJobs.map((job) => (
                  <span key={job} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{job}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => onGoTab("유료 상품 구성")} className="rounded-2xl bg-slate-900 px-4 py-2 text-white">
              상세 리포트 구매 버튼
            </button>
            <button type="button" onClick={() => onGoTab("자기소개서 첨삭")} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">
              자기소개서 첨삭하기 버튼
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PricingPage({ onBuyReport, onGoDiagnosis }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PRICING_PRODUCTS.map((item) => (
        <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-sm text-slate-500">대상: {item.target}</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{item.price}</p>
          <p className="mt-3 text-sm text-slate-700">{item.desc}</p>
          {item.title === "베이직 리포트" ? (
            <button type="button" onClick={onBuyReport} className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-white">
              {item.cta}
            </button>
          ) : item.title === "무료 진단" ? (
            <button type="button" onClick={onGoDiagnosis} className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">
              {item.cta}
            </button>
          ) : (
            <button type="button" className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">
              {item.cta}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function BasicReportPage({ generatedReport, onBuyReport, onGoDiagnosis }) {
  if (!generatedReport) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-700">
          아직 생성된 상세 리포트가 없습니다. 유료 상품 구성 탭에서 베이직 리포트의 상세 리포트 구매를 누르면 검사 결과를 기반으로 상세 리포트가 자동 생성됩니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={onBuyReport} className="rounded-2xl bg-slate-900 px-4 py-2 text-white">상세 리포트 구매하기</button>
          <button type="button" onClick={onGoDiagnosis} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">진단 완료하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">생성일: {generatedReport.createdAt}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{generatedReport.title}</h2>
        <p className="mt-3 text-slate-700">{generatedReport.coreSummary}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">커리어 프로파일 해석</h3>
          <p className="mt-2 text-sm text-slate-700">{generatedReport.profileInterpretation}</p>
          <h3 className="mt-4 font-semibold text-slate-900">진로·취업 준비 단계</h3>
          <p className="mt-2 text-sm text-slate-700">{generatedReport.stage.label}: {generatedReport.stage.desc}</p>
          <h3 className="mt-4 font-semibold text-slate-900">핵심 강점</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {generatedReport.keyStrengths.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-900">추천 직무 TOP 10</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {generatedReport.recommendedJobs.map((job) => <span key={job} className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">{job}</span>)}
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">다음 실행전략</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {generatedReport.nextStrategies.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <button type="button" onClick={() => window.print()} className="mt-6 rounded-2xl bg-slate-900 px-4 py-2 text-white">
            PDF 저장 / 인쇄
          </button>
        </div>
      </div>
    </div>
  );
}

function CoverLetterPage({ diagnosisData }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [items, setItems] = useState(
    COVER_LETTER_QUESTIONS.map((n) => ({ id: n, question: `문항 ${n}`, answer: "" }))
  );

  const inputCount = useMemo(() => items.filter((it) => it.answer.trim().length > 0).length, [items]);
  const totalChars = useMemo(() => items.reduce((sum, it) => sum + (it.answer?.length || 0), 0), [items]);
  const analyses = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        result: it.answer.trim() ? analyzeCoverLetter(it.answer, company, role, diagnosisData) : null,
      })),
    [items, company, role, diagnosisData]
  );
  const avgScore = useMemo(() => {
    const valid = analyses.filter((a) => a.result).map((a) => a.result.total);
    return valid.length ? Math.round(average(valid)) : 0;
  }, [analyses]);

  function updateItem(id, key, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
      <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold text-slate-900">첨삭 대시보드</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p>입력 문항 수: {inputCount}/4</p>
          <p>평균 첨삭 점수: {avgScore}</p>
          <p>총 입력 글자 수: {totalChars}</p>
          <p>
            현재 모드:{" "}
            <span className="font-medium text-indigo-700">
              {diagnosisData?.isCompleted ? "진단 기반 맞춤 첨삭 모드" : "기본 첨삭 모드"}
            </span>
          </p>
        </div>
      </aside>

      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="지원 회사"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="지원 직무"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        {analyses.map((item) => (
          <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                value={item.question}
                onChange={(e) => updateItem(item.id, "question", e.target.value)}
                placeholder={`문항 ${item.id}`}
              />
            </div>
            <textarea
              className="mt-3 min-h-[120px] w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="답변을 입력하세요."
              value={item.answer}
              onChange={(e) => updateItem(item.id, "answer", e.target.value)}
            />

            {!item.result ? (
              <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800">답변을 입력하면 첨삭 결과가 표시됩니다.</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">문항별 첨삭 점수: {item.result.total}</p>
                  <p className="mt-1 text-slate-700">문항적합도 {item.result.scores.문항적합도} / 직무연결성 {item.result.scores.직무연결성} / 경험구체성 {item.result.scores.경험구체성} / 성과근거 {item.result.scores.성과근거} / 회사맞춤도 {item.result.scores.회사맞춤도}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                  <p className="font-semibold">좋은 점</p>
                  <ul className="mt-1 list-disc pl-5">
                    {item.result.strengths.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-800">
                  <p className="font-semibold">보완할 점</p>
                  <ul className="mt-1 list-disc pl-5">
                    {item.result.improvements.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-800">
                  <p className="font-semibold">진단 결과 기반 맞춤 첨삭 포인트</p>
                  <ul className="mt-1 list-disc pl-5">
                    {item.result.diagnosisGuide.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700">
                  <p><span className="font-semibold text-slate-900">추천 수정 구조:</span> {item.result.structure}</p>
                  <p className="mt-2"><span className="font-semibold text-slate-900">문장 수정 예시:</span> {item.result.rewrittenSample}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CareerDiagnosisMVP() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generatedReport, setGeneratedReport] = useState(null);
  const [modal, setModal] = useState({ open: false, message: "", actionText: "", action: null });

  const diagnosisResult = useMemo(() => {
    const allQuestions = DIAGNOSIS_SECTIONS.flatMap((s) => s.questions);
    if (Object.keys(answers || {}).length !== allQuestions.length) return null;

    const interestMap = { R: [], I: [], A: [], S: [], E: [], C: [] };
    const personalityMap = { 외향성: [], 성실성: [], 개방성: [], 친화성: [], 정서안정성: [] };
    const aptitudeMap = { 언어이해: [], 수리논리: [], 문제해결: [], 대인설명: [], 실행관리: [] };
    const maturityScores = [];
    const readinessScores = [];

    DIAGNOSIS_SECTIONS.forEach((section) => {
      section.questions.forEach((q) => {
        const score = Number(answers?.[q.id] || 0);
        if (section.key === "interest") interestMap[q.trait]?.push(score);
        if (section.key === "personality") personalityMap[q.trait]?.push(score);
        if (section.key === "aptitude") aptitudeMap[q.trait]?.push(score);
        if (section.key === "maturity") maturityScores.push(score);
        if (section.key === "readiness") readinessScores.push(score);
      });
    });

    const interestAvg = Object.fromEntries(Object.entries(interestMap).map(([k, v]) => [k, average(v)]));
    const personalityAvg = Object.fromEntries(Object.entries(personalityMap).map(([k, v]) => [k, average(v)]));
    const aptitudeAvg = Object.fromEntries(Object.entries(aptitudeMap).map(([k, v]) => [k, average(v)]));

    const topInterest = toTopEntries(interestAvg, 3);
    const topPersonality = toTopEntries(personalityAvg, 3);
    const topAptitude = toTopEntries(aptitudeAvg, 3);
    const maturityAvg = average(maturityScores);
    const readinessAvg = average(readinessScores);
    const stage = calculateReadinessStage(maturityAvg, readinessAvg);
    const recommendedJobs = createRecommendedJobs(topInterest);

    return {
      isCompleted: true,
      interestAvg,
      personalityAvg,
      aptitudeAvg,
      topInterest,
      topPersonality,
      topAptitude,
      maturityAvg,
      readinessAvg,
      stage,
      recommendedJobs,
      summary: `상위 흥미유형은 ${topInterest.map((x) => x[0]).join("-")}이며, 성격 강점은 ${topPersonality
        .map((x) => x[0])
        .join(", ")}입니다. 현재 준비단계는 ${stage.label}입니다.`,
    };
  }, [answers]);

  function createDetailedReport() {
    if (!diagnosisResult?.isCompleted) return null;
    const code = diagnosisResult.topInterest.map((x) => x[0]).join("");
    const profileLead = diagnosisResult.topInterest[0]?.[0] || "S";
    const title = `${code} 유형 커리어 상세 리포트`;
    return {
      createdAt: new Date().toLocaleDateString("ko-KR"),
      title,
      careerCode: code,
      coreSummary: diagnosisResult.summary,
      profileInterpretation: `대표 흥미유형 ${profileLead} 기반으로 ${INTEREST_DESCRIPTIONS[profileLead] || "강점을 확장할 수 있습니다."} 성격 강점 ${diagnosisResult.topPersonality
        .map((x) => x[0])
        .join(", ")}과 적성 강점 ${diagnosisResult.topAptitude.map((x) => x[0]).join(", ")}을 결합하면 직무 적합도를 높일 수 있습니다.`,
      stage: diagnosisResult.stage,
      keyStrengths: [
        `성격 강점: ${diagnosisResult.topPersonality.map((x) => `${x[0]}(${x[1].toFixed(2)})`).join(", ")}`,
        `적성 강점: ${diagnosisResult.topAptitude.map((x) => `${x[0]}(${x[1].toFixed(2)})`).join(", ")}`,
        `대표 흥미유형: ${profileLead} - ${INTEREST_DESCRIPTIONS[profileLead] || ""}`,
      ],
      recommendedJobs: diagnosisResult.recommendedJobs,
      nextStrategies: [
        "상위 흥미유형과 연결되는 대표 경험 3개를 STAR 구조로 정리하기",
        "희망 직무 JD에서 핵심 역량 5개를 뽑아 경험과 1:1 매핑하기",
        "이력서/자소서에 성과 수치(%, 건수, 기간) 1개 이상 추가하기",
        "면접 답변용 60초 스크립트(동기/경험/성과/기여) 완성하기",
      ],
    };
  }

  function handleBuyReport() {
    if (!diagnosisResult?.isCompleted) {
      setModal({
        open: true,
        message: "베이직 리포트는 커리어 진단 42문항을 완료한 뒤 생성할 수 있습니다.",
        actionText: "커리어 진단으로 이동",
        action: () => setActiveTab("커리어 진단"),
      });
      return;
    }
    const report = createDetailedReport();
    setGeneratedReport(report);
    setModal({
      open: true,
      message: "상세 리포트가 생성되었습니다. 베이직 리포트 화면에서 전체 내용을 확인할 수 있습니다.",
      actionText: "생성된 상세 리포트 보기",
      action: () => setActiveTab("베이직 리포트"),
    });
  }

  function resetAll() {
    setAnswers({});
    setGeneratedReport(null);
    setActiveSection(0);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">{SERVICE_NAME}</h1>
          <p className="mt-1 text-sm text-slate-600">AI 커리어 프로파일 진단 + 베이직 리포트 + 자기소개서 4문항 첨삭</p>
          <nav className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  activeTab === tab ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "커리어 진단" && (
          <DiagnosisPage
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            answers={answers}
            setAnswers={setAnswers}
            diagnosisResult={diagnosisResult}
            onResetAll={resetAll}
            onGoTab={setActiveTab}
          />
        )}
        {activeTab === "유료 상품 구성" && <PricingPage onBuyReport={handleBuyReport} onGoDiagnosis={() => setActiveTab("커리어 진단")} />}
        {activeTab === "베이직 리포트" && (
          <BasicReportPage generatedReport={generatedReport} onBuyReport={handleBuyReport} onGoDiagnosis={() => setActiveTab("커리어 진단")} />
        )}
        {activeTab === "자기소개서 첨삭" && <CoverLetterPage diagnosisData={diagnosisResult || { isCompleted: false }} />}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <p className="text-sm text-slate-700">{modal.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModal({ open: false, message: "", actionText: "", action: null })} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-700">
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  modal.action?.();
                  setModal({ open: false, message: "", actionText: "", action: null });
                }}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-white"
              >
                {modal.actionText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
