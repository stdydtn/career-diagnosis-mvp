export const scale = [1, 2, 3, 4, 5];

export const riasecLabels = {
  R: { name: "현실형", desc: "도구, 기계, 현장, 실물 중심의 활동을 선호합니다." },
  I: { name: "탐구형", desc: "분석, 연구, 문제해결, 지식 탐구 활동을 선호합니다." },
  A: { name: "예술형", desc: "창의, 표현, 콘텐츠, 자유로운 방식의 활동을 선호합니다." },
  S: { name: "사회형", desc: "교육, 상담, 코칭, 타인의 성장을 돕는 활동을 선호합니다." },
  E: { name: "진취형", desc: "설득, 리더십, 성과창출, 프로젝트 추진 활동을 선호합니다." },
  C: { name: "관습형", desc: "문서, 절차, 데이터, 체계적 관리 업무를 선호합니다." },
};

export const personalityLabels = {
  외향성: "사람들과 대화하고 의견을 나누는 과정에서 에너지를 얻는 편입니다.",
  성실성: "맡은 일을 책임감 있게 끝까지내려는 편입니다.",
  개방성: "새로운 방식이나 아이디어를 받아들이는 데 비교적 열려 있는 편입니다.",
  친화성: "상대방의 입장을 고려하고 협력적으로 관계를 만드는 편입니다.",
  정서안정성: "예상치 못한 상황에서도 비교적 침착하게 대안을 찾는 편입니다.",
};

export const aptitudeLabels = {
  언어이해: "글이나 말의 핵심을 빠르게 파악하고 정리하는 힘이 있습니다.",
  수리논리: "숫자와 자료를 비교하고 의미를 찾는 힘이 있습니다.",
  문제해결: "문제를 쪼개어 원인을 찾고 해결 순서를 정하는 힘이 있습니다.",
  대인설명: "상대방이 이해하기 쉽게 설명하고 설득하는 힘이 있습니다.",
  실행관리: "해야 할 일을 정리하고 우선순위에 따라 끝까지 진행하는 힘이 있습니다.",
};

export const easyInterestText = {
  R: "직접 손으로 다루거나 현장에서 문제를 해결하는 일을 선호하는 편입니다. 실제 결과물이 보이는 일을 할 때 몰입도가 높을 수 있습니다.",
  I: "자료를 살펴보고 원인을 분석하는 일을 선호하는 편입니다. 근거를 확인하고 논리적으로 판단할 때 강점이 잘 드러납니다.",
  A: "새로운 아이디어를 내고 글, 이미지, 콘텐츠처럼 무언가를 표현하는 일을 선호하는 편입니다.",
  S: "사람을 돕고 설명하고 성장시키는 일을 선호하는 편입니다. 상대방의 고민을 듣고 방향을 잡아주는 역할에서 강점이 나타납니다.",
  E: "목표를 세우고 사람을 설득하거나 일을 추진하는 역할을 선호하는 편입니다. 성과를 만들고 프로젝트를 끌고 가는 상황에서 강점이 나타납니다.",
  C: "자료, 일정, 문서, 절차를 체계적으로 정리하는 일을 선호하는 편입니다. 정확성이 중요한 업무에서 안정적으로 성과를 낼 수 있습니다.",
};

export const jobMap = {
  S: ["진로·취업 컨설턴트", "HRD·교육기획", "상담·코칭", "고객성공관리", "사회복지·공공서비스"],
  E: ["영업관리", "사업개발", "프로젝트 매니저", "창업·스타트업", "마케팅 기획"],
  C: ["공공기관 행정", "총무·운영관리", "회계·재무지원", "사업관리", "품질·문서관리"],
  I: ["데이터 분석", "전략기획", "연구개발", "정책분석", "IT기획"],
  A: ["콘텐츠 기획", "브랜딩", "UX기획", "디자인", "홍보·SNS마케팅"],
  R: ["생산관리", "설비·시설관리", "기술영업", "건설·안전관리", "제조현장관리"],
};

export const questions = [
  { id: 1, section: "흥미검사", type: "interest", key: "R", text: "기계, 도구, 장비를 직접 다루는 활동에 흥미가 있다." },
  { id: 2, section: "흥미검사", type: "interest", key: "R", text: "현장에서 직접 움직이며 문제를 해결하는 일이 잘 맞는다." },
  { id: 3, section: "흥미검사", type: "interest", key: "I", text: "문제를 분석하고 원인을 찾는 과정이 흥미롭다." },
  { id: 4, section: "흥미검사", type: "interest", key: "I", text: "자료를 조사하고 근거를 바탕으로 판단하는 일을 좋아한다." },
  { id: 5, section: "흥미검사", type: "interest", key: "A", text: "글쓰기, 디자인, 콘텐츠 제작처럼 표현하는 활동에 흥미가 있다." },
  { id: 6, section: "흥미검사", type: "interest", key: "A", text: "정해진 방식보다 나만의 방식으로 일하는 것을 선호한다." },
  { id: 7, section: "흥미검사", type: "interest", key: "S", text: "사람을 돕거나 상담하는 일에 보람을 느낀다." },
  { id: 8, section: "흥미검사", type: "interest", key: "S", text: "교육, 코칭, 멘토링 활동에 관심이 있다." },
  { id: 9, section: "흥미검사", type: "interest", key: "E", text: "사람을 설득하거나 이끄는 역할에 자신이 있다." },
  { id: 10, section: "흥미검사", type: "interest", key: "E", text: "새로운 사업이나 프로젝트를 추진하는 데 흥미가 있다." },
  { id: 11, section: "흥미검사", type: "interest", key: "C", text: "문서, 일정, 절차를 체계적으로 관리하는 일이 잘 맞는다." },
  { id: 12, section: "흥미검사", type: "interest", key: "C", text: "정확성, 규칙, 기준을 지키는 업무가 편하다." },
  { id: 13, section: "흥미검사", type: "interest", key: "I", text: "직업이나 산업에 대한 정보를 찾아보고 비교하는 활동에 흥미가 있다." },
  { id: 14, section: "흥미검사", type: "interest", key: "S", text: "다른 사람의 진로 고민을 듣고 함께 방향을 찾아보는 활동에 흥미가 있다." },
  { id: 15, section: "흥미검사", type: "interest", key: "E", text: "목표를 정하고 사람들과 함께 성과를 만들어내는 활동에 흥미가 있다." },
  { id: 16, section: "성격검사", type: "personality", key: "외향성", text: "새로운 사람을 만나고 대화하는 과정에서 에너지를 얻는다." },
  { id: 17, section: "성격검사", type: "personality", key: "외향성", text: "발표나 대외활동처럼 사람 앞에 서는 상황이 비교적 편하다." },
  { id: 18, section: "성격검사", type: "personality", key: "성실성", text: "맡은 일을 끝까지 책임지고 완수하려는 편이다." },
  { id: 19, section: "성격검사", type: "personality", key: "성실성", text: "일정, 기준, 마감기한을 지키는 것을 중요하게 생각한다." },
  { id: 20, section: "성격검사", type: "personality", key: "개방성", text: "새로운 방식이나 아이디어를 시도하는 데 거부감이 적다." },
  { id: 21, section: "성격검사", type: "personality", key: "개방성", text: "변화가 있는 환경에서 새로운 가능성을 찾는 편이다." },
  { id: 22, section: "성격검사", type: "personality", key: "친화성", text: "타인의 입장을 고려하며 협력적으로 일하는 편이다." },
  { id: 23, section: "성격검사", type: "personality", key: "친화성", text: "갈등 상황에서도 관계를 해치지 않도록 조율하려고 한다." },
  { id: 24, section: "성격검사", type: "personality", key: "정서안정성", text: "압박감이 있는 상황에서도 비교적 침착하게 대응한다." },
  { id: 25, section: "성격검사", type: "personality", key: "정서안정성", text: "예상치 못한 문제가 생겨도 쉽게 무너지지 않고 대안을 찾는다." },
  { id: 26, section: "적성 자가진단", type: "aptitude", key: "언어이해", text: "글이나 자료를 읽고 핵심 내용을 빠르게 정리하는 편이다." },
  { id: 27, section: "적성 자가진단", type: "aptitude", key: "언어이해", text: "복잡한 내용을 상대방이 이해하기 쉽게 문장으로 풀어낼 수 있다." },
  { id: 28, section: "적성 자가진단", type: "aptitude", key: "수리논리", text: "숫자, 표, 그래프를 보고 의미를 파악하는 일이 어렵지 않다." },
  { id: 29, section: "적성 자가진단", type: "aptitude", key: "수리논리", text: "자료를 비교하고 논리적으로 결론을 내리는 편이다." },
  { id: 30, section: "적성 자가진단", type: "aptitude", key: "문제해결", text: "문제가 생기면 원인을 나누어 보고 해결순서를 정하는 편이다." },
  { id: 31, section: "적성 자가진단", type: "aptitude", key: "문제해결", text: "기존 방식보다 더 나은 대안을 찾아보려는 편이다." },
  { id: 32, section: "적성 자가진단", type: "aptitude", key: "대인설명", text: "상대방의 수준에 맞게 설명하거나 설득하는 일이 비교적 자신 있다." },
  { id: 33, section: "적성 자가진단", type: "aptitude", key: "대인설명", text: "사람의 고민을 듣고 필요한 방향을 정리해주는 편이다." },
  { id: 34, section: "적성 자가진단", type: "aptitude", key: "실행관리", text: "해야 할 일을 목록화하고 우선순위를 정해 처리하는 편이다." },
  { id: 35, section: "적성 자가진단", type: "aptitude", key: "실행관리", text: "여러 업무가 동시에 있어도 일정과 자료를 정리하며 진행할 수 있다." },
  { id: 36, section: "진로성숙도검사", type: "maturity", key: "자기이해", text: "내 강점과 약점을 어느 정도 구체적으로 설명할 수 있다." },
  { id: 37, section: "진로성숙도검사", type: "maturity", key: "직업정보", text: "관심 직무가 실제로 어떤 일을 하는지 조사해본 적이 있다." },
  { id: 38, section: "진로성숙도검사", type: "maturity", key: "의사결정", text: "직업을 선택할 때 나에게 중요한 기준이 분명하다." },
  { id: 39, section: "진로성숙도검사", type: "maturity", key: "계획성", text: "희망 직무를 위해 어떤 준비를 해야 하는지 계획을 세워본 적이 있다." },
  { id: 40, section: "진로성숙도검사", type: "maturity", key: "준비행동", text: "최근 1개월 내 취업이나 진로를 위해 실제 행동을 한 적이 있다." },
  { id: 41, section: "경력준비도검사", type: "readiness", key: "경험정리", text: "프로젝트, 인턴, 아르바이트, 대외활동 경험을 직무별로 정리해두었다." },
  { id: 42, section: "경력준비도검사", type: "readiness", key: "성과정리", text: "내 경험에서 성과나 기여도를 수치 또는 사례로 설명할 수 있다." },
  { id: 43, section: "경력준비도검사", type: "readiness", key: "직무매칭", text: "내 경험이 어떤 직무역량과 연결되는지 설명할 수 있다." },
  { id: 44, section: "경력준비도검사", type: "readiness", key: "지원준비", text: "희망 직무에 맞는 이력서나 자기소개서를 준비하고 있다." },
  { id: 45, section: "경력준비도검사", type: "readiness", key: "면접준비", text: "나의 경험을 면접 답변으로 말할 수 있도록 연습해본 적이 있다." },
];

export const emptyProfile = {
  name: "",
  phone: "",
  email: "",
  ageGroup: "",
  status: "",
  education: "",
  school: "",
  major: "",
  gpa: "",
  certificates: "",
  languageScores: "",
  targetJob: "",
  targetCompanyType: "",
  region: "",
  referral: "",
  privacyConsent: false,
  marketingConsent: false,
};

export const emptyFeedback = {
  satisfaction: "",
  usefulness: "",
  easyToUse: "",
  recommend: "",
  bestFeature: "",
  improvement: "",
  desiredService: "",
  paidIntent: "",
};

export function buildDiagnosisPages() {
  const sections = [...new Set(questions.map((q) => q.section))];
  return sections.flatMap((section) => {
    const sectionQuestions = questions.filter((q) => q.section === section);
    const chunks = [];
    for (let i = 0; i < sectionQuestions.length; i += 5) {
      chunks.push({ section, questions: sectionQuestions.slice(i, i + 5) });
    }
    return chunks;
  });
}

function runSelfTests() {
  const pages = buildDiagnosisPages();
  const allIds = questions.map((q) => q.id);
  const uniqueIds = new Set(allIds);
  console.assert(questions.length === 45, "진단 문항은 총 45개여야 합니다.");
  console.assert(uniqueIds.size === questions.length, "문항 번호는 중복되지 않아야 합니다.");
  console.assert(questions.filter((q) => q.section === "흥미검사").length === 15, "흥미검사는 15문항이어야 합니다.");
  console.assert(pages.every((page) => page.questions.length <= 5), "각 페이지는 최대 5문항이어야 합니다.");
  console.assert(pages.every((page) => page.questions.every((q) => q.section === page.section)), "한 페이지에 서로 다른 검사가 섞이면 안 됩니다.");
}

runSelfTests();
