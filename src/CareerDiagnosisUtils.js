import {
  aptitudeLabels,
  easyInterestText,
  jobMap,
  personalityLabels,
  questions,
  riasecLabels,
} from "./CareerDiagnosisData.js";

export function average(values) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function pct(score) {
  return Math.round((score / 5) * 100);
}

export function computeScores(answers, type) {
  const grouped = {};
  questions.filter((q) => q.type === type).forEach((q) => {
    if (!grouped[q.key]) grouped[q.key] = [];
    if (answers[q.id]) grouped[q.key].push(answers[q.id]);
  });
  return Object.fromEntries(Object.entries(grouped).map(([key, values]) => [key, average(values)]));
}

export function topEntries(scores, count = 3) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, count);
}

export function getReadinessLevel(maturityAvg, readinessAvg) {
  if (maturityAvg < 3.2) return { label: "탐색 우선형", desc: "직업 선택 기준과 자기이해를 먼저 정리해야 하는 단계입니다." };
  if (readinessAvg < 3.3) return { label: "방향 설정형", desc: "관심 직무는 어느 정도 잡혔으나 경험 정리와 지원 준비가 더 필요한 단계입니다." };
  return { label: "실행 강화형", desc: "진로 방향과 준비행동이 비교적 갖춰져 있어 실전 지원 전략을 고도화할 단계입니다." };
}

export function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function createDetailedReport(result, profile, feedback) {
  const topInterest = result.topRIASEC[0]?.[0] || "S";
  const secondInterest = result.topRIASEC[1]?.[0] || "E";
  const thirdInterest = result.topRIASEC[2]?.[0] || "C";
  const topPersonality = result.topPersonality[0]?.[0] || "성실성";
  const topAptitude = result.topAptitude[0]?.[0] || "문제해결";
  const code = [topInterest, secondInterest, thirdInterest].join("");
  const jobs = result.jobs.length ? result.jobs : jobMap[topInterest];

  return {
    createdAt: new Date().toLocaleDateString("ko-KR"),
    code,
    title: `${riasecLabels[topInterest].name} 성향이 강한 커리어 상세 리포트`,
    participant: profile,
    feedback,
    summary: `${profile.name ? `${profile.name}님은 ` : ""}${easyInterestText[topInterest]} 특히 ${riasecLabels[secondInterest].name} 성향과 ${riasecLabels[thirdInterest].name} 성향도 함께 나타나므로, 직업을 선택할 때는 관심 있는 업무 내용뿐 아니라 일하는 방식과 환경까지 함께 고려하는 것이 좋습니다.`,
    profileText: `검사 결과를 쉽게 정리하면, ${profile.name ? `${profile.name}님은 ` : "해당 사용자는 "}${riasecLabels[topInterest].name} 성향이 가장 높게 나타났습니다. ${easyInterestText[topInterest]} 함께 나타난 보조 성향은 ${riasecLabels[secondInterest].name}, ${riasecLabels[thirdInterest].name}입니다. 하나의 정답 직업을 찾기보다, 내가 좋아하는 일의 방식과 잘하는 업무 방식을 함께 고려해 직무를 선택하는 것이 좋습니다.`,
    strengths: [
      `일하는 방식의 강점: ${easyInterestText[topInterest]}`,
      `성격적 강점: ${personalityLabels[topPersonality]}`,
      `업무 역량 강점: ${aptitudeLabels[topAptitude]}`,
    ],
    stage: `현재 진로·취업 준비 단계는 '${result.level.label}'입니다. 쉽게 말해, ${result.level.desc}`,
    recommendedJobs: jobs.slice(0, 5),
    actionPlan: [
      "추천 직무 5개 중 가장 관심 있는 직무 1~2개를 먼저 골라보세요.",
      "선택한 직무의 채용공고를 3개 이상 확인하고 반복되는 요구역량을 정리하세요.",
      "본인의 경험을 지원 직무와 연결해 자기소개서 소재로 정리하세요.",
      "부족한 부분은 자격증, 프로젝트, 인턴, 포트폴리오 중 하나의 방식으로 보완하세요.",
    ],
  };
}

export function buildPlainTextReport(report) {
  const lines = [];
  lines.push(report.title);
  lines.push(`생성일: ${report.createdAt}`);
  lines.push("");
  lines.push("[참여자 정보]");
  lines.push(`이름: ${report.participant?.name || "-"}`);
  lines.push(`상태: ${report.participant?.status || "-"}`);
  lines.push(`학교: ${report.participant?.school || "-"}`);
  lines.push(`전공: ${report.participant?.major || "-"}`);
  lines.push(`학점: ${report.participant?.gpa || "-"}`);
  lines.push(`희망직무: ${report.participant?.targetJob || "-"}`);
  lines.push(`자격증: ${report.participant?.certificates || "-"}`);
  lines.push(`어학성적: ${report.participant?.languageScores || "-"}`);
  lines.push("");
  lines.push("[커리어 요약]");
  lines.push(report.summary);
  lines.push("");
  lines.push("[쉽게 보는 나의 진로 성향]");
  lines.push(report.profileText);
  lines.push("");
  lines.push("[진로·취업 준비 단계]");
  lines.push(report.stage);
  lines.push("");
  lines.push("[나의 핵심 강점]");
  report.strengths.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("");
  lines.push("[추천 직무 TOP 5]");
  report.recommendedJobs.forEach((job, index) => lines.push(`${index + 1}. ${job}`));
  lines.push("");
  lines.push("[다음 실행전략]");
  report.actionPlan.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  return lines;
}

export function buildCoverLetterReview(item, company, job, result, isComplete) {
  const answer = item.answer.trim();
  const question = item.question.trim();
  if (!answer) return null;

  const length = answer.length;
  const hasDigit = Array.from(answer).some((char) => "0123456789".includes(char));
  const hasNumber = hasDigit || includesAny(answer, ["%", "명", "건", "회", "개월", "년", "점", "만원", "등급"]);
  const hasAction = includesAny(answer, ["기획", "분석", "조사", "운영", "관리", "제안", "실행", "협업", "조율", "개선", "작성", "발표", "상담", "도입", "설계"]);
  const hasResult = includesAny(answer, ["성과", "결과", "개선", "달성", "증가", "감소", "해결", "완료", "수상", "선정", "기여", "합격", "향상"]);
  const hasMotivation = includesAny(answer, ["지원", "직무", "회사", "기업", "역량", "경험", "가치", "목표", "성장", "입사"]);
  const mentionsCompany = company ? answer.includes(company) : false;
  const mentionsJob = job ? answer.includes(job) : false;

  const scores = {
    문항적합도: Math.min(100, 45 + (question ? 15 : 0) + (hasMotivation ? 20 : 0) + (mentionsJob ? 15 : 0)),
    직무연결성: Math.min(100, 40 + (mentionsJob ? 30 : 0) + (hasAction ? 15 : 0) + (isComplete ? 10 : 0)),
    경험구체성: Math.min(100, 35 + (hasAction ? 25 : 0) + (hasNumber ? 20 : 0) + (length >= 500 ? 10 : 0)),
    성과근거: Math.min(100, 30 + (hasResult ? 30 : 0) + (hasNumber ? 25 : 0)),
    회사맞춤도: Math.min(100, 35 + (mentionsCompany ? 30 : 0) + (company ? 10 : 0) + (hasMotivation ? 10 : 0)),
  };

  const total = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
  const strengths = [];
  const improvements = [];

  if (hasAction) strengths.push("경험에서 수행한 행동이 어느 정도 드러납니다.");
  else improvements.push("내가 실제로 한 행동을 구체적인 동사로 보완하세요.");

  if (hasResult || hasNumber) strengths.push("성과나 결과를 설명할 수 있는 단서가 포함되어 있습니다.");
  else improvements.push("성과, 변화, 배운 점을 결과 문장으로 보완하세요.");

  if (mentionsJob) strengths.push("지원 직무와의 연결성이 일부 반영되어 있습니다.");
  else improvements.push("지원 직무명 또는 직무역량을 직접 언급해 직무 적합도를 높이세요.");

  if (mentionsCompany) strengths.push("지원 회사 맞춤 표현이 포함되어 있습니다.");
  else improvements.push("회사명, 사업방향, 고객, 서비스와 연결되는 문장을 1개 이상 추가하세요.");

  if (length < 400) improvements.push("분량이 짧아 경험의 맥락과 결과가 약해 보일 수 있습니다. 최소 500자 이상으로 확장해보세요.");
  if (length > 1300) improvements.push("분량이 길어 핵심이 흐려질 수 있습니다. 한 경험 중심으로 압축하세요.");

  const topInterest = result.topRIASEC[0]?.[0];
  const topPersonality = result.topPersonality[0]?.[0];
  const topAptitude = result.topAptitude[0]?.[0];
  const guides = [];

  if (isComplete && topInterest) guides.push(`흥미유형 ${riasecLabels[topInterest].name} 기준으로 강점이 드러나는 경험을 앞쪽에 배치하세요.`);
  if (isComplete && topPersonality) guides.push(`성격 강점 ${topPersonality} 기준으로 실제 행동 사례를 강화하세요.`);
  if (isComplete && topAptitude) guides.push(`업무 강점 ${topAptitude} 기준으로 문제 해결 과정과 결과를 연결하세요.`);
  if (!isComplete) guides.push("커리어 진단을 완료하면 흥미유형, 성격, 적성 결과를 반영한 맞춤 첨삭이 활성화됩니다.");

  const revisedOpening = job ? `저는 ${job} 직무에서 필요한 문제해결력과 실행력을 경험으로 증명해온 지원자입니다.` : "저는 지원 직무에서 필요한 핵심역량을 실제 경험으로 증명해온 지원자입니다.";
  const revisedMiddle = topAptitude && isComplete ? `특히 ${topAptitude} 역량을 바탕으로 문제 상황을 구조적으로 파악하고 필요한 행동을 실행해 결과를 만들어낸 경험이 있습니다.` : "특히 문제 상황을 구조적으로 파악하고 필요한 행동을 실행해 결과를 만들어낸 경험이 있습니다.";
  const revisedClosing = company ? `이 경험을 바탕으로 ${company}에서도 직무 목표를 정확히 이해하고 성과를 만드는 구성원이 되겠습니다.` : "이 경험을 바탕으로 입사 후에도 직무 목표를 정확히 이해하고 성과를 만드는 구성원이 되겠습니다.";

  return {
    length,
    total,
    scores,
    strengths: strengths.length ? strengths : ["기본적인 자기소개서 문장 구성이 확인됩니다."],
    improvements,
    guides,
    structure: ["첫 문장: 지원 직무에서 발휘할 핵심 강점 1개 제시", "중간 문단: 상황, 행동, 결과 순서로 경험 설명", "마무리: 회사와 직무에서의 기여 방향 연결"],
    sampleDraft: [revisedOpening, revisedMiddle, revisedClosing].join("\n\n"),
  };
}
