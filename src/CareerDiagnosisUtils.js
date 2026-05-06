import {
  aptitudeLabels,
  easyInterestText,
  jobMap,
  jobSeekerHints,
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
  if (maturityAvg < 3.2) {
    return {
      label: "탐색 우선형",
      desc: "직무 정보와 나의 기준을 아직 맞춰 가야 하는 단계예요. 서류부터 채우기보다 방향을 좁히는 데 시간을 쓰면 이후 준비가 빨라집니다.",
      studentVoice: "'뭘 지원해야 할지 모르겠다'는 느낌이 들 수 있는 구간이에요. 지원 횟수보다 정보와 자기 이해를 쌓는 쪽에 비중을 두면 좋습니다.",
      bullets: [
        "관심 산업·직무 후보를 3개만 적고, 각각 채용공고 2개씩만 읽으며 하는 일·자격 요건만 메모해 보세요.",
        "프로젝트·알바·동아리 경험을 시간 순으로 적은 뒤, 각각에서 맡은 역할 한 줄·성과 한 줄만 추려 보세요.",
        "혼자만의 노트로 '나에게 중요한 조건 3가지'(예: 사람 대하는 빈도, 분석 비중, 근무 형태)를 적어 두면 다음 선택이 쉬워져요.",
      ],
    };
  }
  if (readinessAvg < 3.3) {
    return {
      label: "방향 설정형",
      desc: "대략의 방향은 잡혔지만 경험과 서류가 한 줄로 연결되지 않은 단계예요. 공고 언어로 경험을 번역하는 연습이 필요합니다.",
      studentVoice: "'무엇을 지원할지는 대충 보이는데, 내 스펙으로 어떻게 말해야 할지 애매한' 상태에 가깝습니다.",
      bullets: [
        "희망 직무 채용공고 5개에서 반복되는 요구역량 키워드를 10개 이내로 모아, 내 경험과 짝지을 수 있는 것만 체크해 보세요.",
        "STAR(상황·과제·행동·결과)로 경험 3개만 완성해 두면 자소서 문항 대부분을 재사용할 수 있어요.",
        "이력서에는 직무와 무관한 나열 대신, 지원 직무에 붙일 한 줄 요약(예: ○○ 직무 지원 – 데이터 정리·발표 경험)을 달아 보세요.",
      ],
    };
  }
  return {
    label: "실행 강화형",
    desc: "진로 방향과 준비 행동이 어느 정도 정리되어 있어, 지원과 피드백으로 설득력을 올리면 되는 단계예요.",
    studentVoice: "이제는 '무엇을 할지'보다 '어떻게 더 매력 있게 보여줄지'를 다듬는 시기에 가깝습니다.",
    bullets: [
      "회사·직무별로 자소서 일부만 바꿔도 합격 가능성이 달라집니다. 회사 미션·고객·서비스 관련 단어를 본문에 한 번 이상 넣어 보세요.",
      "모의 면접이 부담되면 STAR 경험 3개를 친구에게 말로만 설명해 보고, 빠진 숫자·결과를 채워 넣으세요.",
      "탈락·무응답이 나오면 서류·면접 중 어디가 애매했는지 한 줄씩만 기록해 두면 다음 지원에 바로 반영할 수 있어요.",
    ],
  };
}

export function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function formatStageBlock(level) {
  const bullets = Array.isArray(level.bullets) ? level.bullets : [];
  return [
    `지금은 '${level.label}' 단계에 가깝게 보입니다.`,
    level.studentVoice || "",
    level.desc || "",
    "",
    "▼ 이 단계에서 우선하면 좋은 준비",
    ...bullets.map((b) => `• ${b}`),
  ]
    .join("\n")
    .trim();
}

function buildStrengthItems(topInterest, topPersonality, topAptitude) {
  const rName = riasecLabels[topInterest]?.name || "진로 성향";
  return [
    `【흥미·업무 스타일】 ${easyInterestText[topInterest]} 지원 동기·직무 이해 문항에는 '${rName}'에 맞는 일하는 방식(몰입하는 지점, 협업·독립 비중 등)을 한 문장으로 넣어 보세요.`,
    `【성격】 ${personalityLabels[topPersonality]} 면접에서 협업·마감·갈등 상황 질문이 나오면, 그때의 행동을 이 성향과 연결해 말하면 답변이 한결 모여 들립니다.`,
    `【역량】 ${aptitudeLabels[topAptitude]} 자소서·포트폴리오에는 문제 인식 → 내가 한 일 → 결과 순으로, 이 역량이 드러나는 사례 하나만 깊게 파는 편이 효과적이에요.`,
  ];
}

function buildRecommendedJobEntries(jobs) {
  const fallbackTip = "채용공고에서 반복되는 요구역량 키워드를 적어 두고, 내 경험을 그 단어로 번역해 보세요.";
  return jobs.slice(0, 5).map((title) => ({
    title,
    tip: jobSeekerHints[title] || fallbackTip,
  }));
}

export function recommendedJobTitle(job) {
  if (job == null) return "";
  return typeof job === "string" ? job : job.title ?? "";
}

export function createDetailedReport(result, profile, feedback) {
  const topInterest = result.topRIASEC[0]?.[0] || "S";
  const secondInterest = result.topRIASEC[1]?.[0] || "E";
  const thirdInterest = result.topRIASEC[2]?.[0] || "C";
  const topPersonality = result.topPersonality[0]?.[0] || "성실성";
  const topAptitude = result.topAptitude[0]?.[0] || "문제해결";
  const code = [topInterest, secondInterest, thirdInterest].join("");
  const jobs = result.jobs.length ? result.jobs : jobMap[topInterest];
  const namePrefix = profile.name ? `${profile.name}님, ` : "";

  return {
    createdAt: new Date().toLocaleDateString("ko-KR"),
    code,
    title: `${riasecLabels[topInterest].name} 성향이 강한 커리어 상세 리포트`,
    participant: profile,
    feedback,
    summary: `${namePrefix}검사에서는 ${riasecLabels[topInterest].name} 성향이 가장 두드러지고, ${riasecLabels[secondInterest].name}·${riasecLabels[thirdInterest].name} 성향이 함께 보이는 편이에요. 취업 준비에서는 '어떤 일을 좋아하는지'만큼 '어떤 방식으로 일할 때 강해지는지'를 서류·면접에서 같은 언어로 맞춰 주면 좋습니다.`,
    profileText: [
      `흥미 코드는 ${code} 순서(${riasecLabels[topInterest].name} → ${riasecLabels[secondInterest].name} → ${riasecLabels[thirdInterest].name})예요. 한마디로 하면 ${easyInterestText[topInterest]}`,
      `정답 직무 하나를 찾기보다, 위 순서를 노트에 적어 두고 지원할 회사의 직무 소개·채용공고 문장과 비교해 보세요. 내 경험이 어떤 스타일의 업무에 가깝는지 스스로 번역하는 연습이 됩니다.`,
      `자소서에서는 공고에 반복되는 동사·역량 단어(협업, 분석, 고객 응대 등)를 골라, 경험 문장을 그 단어로 시작하거나 마무리해 보세요. 면접에서는 같은 말을 30초·1분 버전으로 각각 말해 보는 연습만 해도 준비도가 확 달라져요.`,
    ].join("\n\n"),
    strengths: buildStrengthItems(topInterest, topPersonality, topAptitude),
    stage: formatStageBlock(result.level),
    recommendedJobs: buildRecommendedJobEntries(jobs),
    actionPlan: [
      "추천 직무 TOP 5 중 이번 시즌에 파고들 1~2개만 정하고, 직무별 채용공고를 최소 5개씩 스크랩하세요. 공통으로 나오는 요구역량 키워드를 노트에 모아 두면 그게 곧 자소서 목차가 됩니다.",
      "경험을 STAR(상황·과제·행동·결과) 한 세트로 3개만 완성하세요. 숫자가 없으면 기간·참여 인원·완료 여부처럼 적어도 되는 단위부터 채워 넣어 보세요.",
      "이력서 상단이나 자소서 첫 문단에 '지원 직무 + 내 역량 두 단어 + 대표 경험 한 줄' 구조로 요약 한 줄을 넣으면 서류 통과에 도움이 되는 경우가 많아요.",
      "회사마다 자소서를 처음부터 다 쓰지 말고, 본문 뼈대는 재사용하고 지원 동기·회사 이해 문단만 바꾸는 방식으로 시간을 아끼세요.",
      "면접 전 '왜 이 직무인가'와 '왜 이 회사인가'를 각각 30초 버전으로 말해 보고, 녹음해서 어색한 표현만 고쳐도 실전감이 확 올라갑니다.",
      "탈락·무응답이 나와도 지원한 공고 링크와 제출한 파일 날짜를 한 줄씩만 기록해 두세요. 다음 수정 포인트를 찾기 쉬워집니다.",
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
  report.recommendedJobs.forEach((job, index) => {
    const title = recommendedJobTitle(job);
    const tip = typeof job === "object" && job?.tip ? job.tip : "";
    lines.push(`${index + 1}. ${title}${tip ? `\n   → ${tip}` : ""}`);
  });
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
