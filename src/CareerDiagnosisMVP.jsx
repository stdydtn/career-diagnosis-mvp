import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  aptitudeLabels,
  buildDiagnosisPages,
  emptyFeedback,
  emptyProfile,
  jobMap,
  personalityLabels,
  questions,
  riasecLabels,
  scale,
} from "./CareerDiagnosisData.js";
import {
  average,
  buildCoverLetterReview,
  computeScores,
  createDetailedReport,
  getReadinessLevel,
  normalizeReportLanguage,
  pct,
  topEntries,
} from "./CareerDiagnosisUtils.js";
import {
  insertDiagnosisProfile,
  updateDiagnosisAfterFeedback,
  updateDiagnosisAfterQuestions,
  updateDiagnosisProfile,
} from "./lib/saveDiagnosis.js";
import { buildReportCoachPayload, callCareerAi, fetchReportCoachSafe } from "./lib/careerAiApi.js";
import { callCareerAI } from "./lib/ai.js";

function phase2SessionKey(submissionId) {
  return `mvp_diag_phase2_${submissionId}`;
}

function ScoreBar({ label, value, description }) {
  const safeValue = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="font-bold text-slate-800">{label}</div>
        <div className="text-sm font-black text-slate-900">{safeValue}점</div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900 transition-all duration-500" style={{ width: `${safeValue}%` }} />
      </div>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white" />
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "선택해주세요" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProfileForm({ profile, setProfile, onStart, startBusy }) {
  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));
  const requiredDone = profile.name.trim() && profile.email.trim() && profile.ageGroup && profile.status && profile.privacyConsent;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-slate-300">STEP 0</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">진단 전 기본정보 입력</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-200">진단 결과를 더 정확하게 해석하고, 추후 리포트와 자기소개서 첨삭으로 연결하기 위한 기본정보를 입력합니다.</p>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-500">PARTICIPANT INFO</p>
          <h3 className="text-2xl font-black tracking-tight">개인정보 및 진로정보</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">「진단 시작하기」를 누르면 1차로 프로필이 Supabase에 저장됩니다. 45문항을 모두 응답하면 같은 참가 행에 답변·진단 결과가 2차 저장됩니다.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="이름 / 닉네임 *" value={profile.name} onChange={(value) => update("name", value)} placeholder="예: 홍길동" />
          <InputField label="이메일 *" type="email" value={profile.email} onChange={(value) => update("email", value)} placeholder="예: career@example.com" />
          <InputField label="연락처" value={profile.phone} onChange={(value) => update("phone", value)} placeholder="예: 010-0000-0000" />
          <SelectField label="연령대 *" value={profile.ageGroup} onChange={(value) => update("ageGroup", value)} options={["10대", "20대 초반", "20대 후반", "30대", "40대 이상"]} />
          <SelectField label="현재 상태 *" value={profile.status} onChange={(value) => update("status", value)} options={["대학생", "졸업예정자", "취업준비생", "재직자", "이직준비자", "경력전환 희망자", "기타"]} />
          <SelectField label="최종학력 / 학년" value={profile.education} onChange={(value) => update("education", value)} options={["고등학교 졸업", "대학교 1~2학년", "대학교 3~4학년", "졸업예정", "대졸", "석사 이상", "기타"]} />
          <InputField label="학교" value={profile.school} onChange={(value) => update("school", value)} placeholder="예: 서울대학교, 부산대학교" />
          <InputField label="전공 / 계열" value={profile.major} onChange={(value) => update("major", value)} placeholder="예: 경영학, 기계공학, 컴퓨터공학" />
          <InputField label="학점" value={profile.gpa} onChange={(value) => update("gpa", value)} placeholder="예: 3.8/4.5" />
          <InputField label="자격증" value={profile.certificates} onChange={(value) => update("certificates", value)} placeholder="예: 컴퓨터활용능력 1급, SQLD, ADsP" />
          <InputField label="어학성적" value={profile.languageScores} onChange={(value) => update("languageScores", value)} placeholder="예: TOEIC 850, OPIc IH" />
          <InputField label="희망 직무" value={profile.targetJob} onChange={(value) => update("targetJob", value)} placeholder="예: 인사, 행정, 데이터분석" />
          <SelectField label="희망 기업유형" value={profile.targetCompanyType} onChange={(value) => update("targetCompanyType", value)} options={["대기업", "공기업/공공기관", "중견기업", "중소기업", "스타트업", "외국계", "아직 미정"]} />
          <InputField label="거주/희망 근무지역" value={profile.region} onChange={(value) => update("region", value)} placeholder="예: 부산, 서울, 수도권, 전국" />
          <SelectField label="유입 경로" value={profile.referral} onChange={(value) => update("referral", value)} options={["인스타그램", "블로그", "지인추천", "대학교/기관", "검색", "기타"]} />
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 ring-1 ring-amber-100">
            <input type="checkbox" checked={profile.privacyConsent} onChange={(event) => update("privacyConsent", event.target.checked)} className="mt-1" />
            <span>
              <strong>필수</strong> 개인정보 수집 및 진단 결과 활용에 동의합니다.
            </span>
          </label>
          <label className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-200">
            <input type="checkbox" checked={profile.marketingConsent} onChange={(event) => update("marketingConsent", event.target.checked)} className="mt-1" />
            <span>
              <strong>선택</strong> 취업 콘텐츠, 첨삭 이벤트, 상담 안내 등 마케팅 정보 수신에 동의합니다.
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-6 text-slate-500">* 표시 항목과 필수 동의가 완료되어야 진단을 시작할 수 있습니다.</p>
          <button type="button" onClick={onStart} disabled={!requiredDone || startBusy} className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
            {startBusy ? "저장 중…" : "진단 시작하기"}
          </button>
        </div>
      </section>
    </main>
  );
}

function ProfileSummary({ profile, onEdit }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">참여자 정보</p>
          <h3 className="mt-1 text-xl font-black">{profile.name || "미입력"}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {profile.status || "상태 미입력"} · {profile.school || "학교 미입력"} · 희망직무 {profile.targetJob || "미정"}
          </p>
        </div>
        <button type="button" onClick={onEdit} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black shadow-sm hover:bg-slate-100">
          정보 수정
        </button>
      </div>
    </section>
  );
}

function DiagnosisPage({
  answers,
  setAnswers,
  result,
  isComplete,
  switchTab,
  profile,
  profileReady,
  setProfileReady,
  setGeneratedReport,
  feedback,
  onStartDiagnosis,
  startBusy,
  aiDiagnosis,
  setAiDiagnosis,
  aiLoading,
  setAiLoading,
}) {
  const pages = useMemo(() => buildDiagnosisPages(), []);
  const [currentPage, setCurrentPage] = useState(0);
  const questionTopRef = useRef(null);
  const currentPageData = pages[currentPage] || pages[0];
  const currentQuestions = currentPageData?.questions || [];
  const currentPageDone = currentQuestions.every((q) => answers[q.id]);
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const sectionStats = [...new Set(questions.map((q) => q.section))].map((section) => {
    const sectionQuestions = questions.filter((q) => q.section === section);
    const answered = sectionQuestions.filter((q) => answers[q.id]).length;
    const firstPageIndex = pages.findIndex((page) => page.section === section);
    return { section, answered, total: sectionQuestions.length, firstPageIndex };
  });
  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const [aiInsightError, setAiInsightError] = useState("");

  const fetchAiInsight = async () => {
    if (!isComplete || aiDiagnosis) return;
    setAiInsightError("");
    try {
      setAiLoading(true);
      const aiResult = await callCareerAI({
        mode: "diagnosis",
        profile: profile.value,
        answers,
        result,
      });
      setAiDiagnosis(aiResult.data || aiResult.raw);
    } catch (err) {
      setAiInsightError(err.message || String(err));
    } finally {
      setAiLoading(false);
    }
  };

  const movePage = (nextPage) => {
    setCurrentPage(Math.max(0, Math.min(pages.length - 1, nextPage)));
    setTimeout(() => questionTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  if (!profileReady) {
    return <ProfileForm profile={profile.value} setProfile={profile.set} onStart={onStartDiagnosis} startBusy={startBusy} />;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-5">
        <ProfileSummary profile={profile.value} onEdit={() => setProfileReady(false)} />
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold text-slate-500">검사 진행률</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight">{progress}%</span>
            <span className="pb-2 text-sm text-slate-500">
              {answeredCount}/{questions.length}문항
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            현재 {currentPage + 1}/{pages.length}페이지 · 검사별 최대 5문항
          </p>
        </section>
        <section className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          {sectionStats.map((item, index) => {
            const active = currentPageData?.section === item.section;
            return (
              <button key={item.section} type="button" onClick={() => movePage(item.firstPageIndex)} className={`mb-2 w-full rounded-2xl px-4 py-3 text-left transition ${active ? "bg-slate-900 text-white shadow-sm" : "hover:bg-slate-100"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">
                      {index + 1}. {item.section} ({item.answered}/{item.total})
                    </div>
                    <div className={`mt-1 text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>검사별 페이지는 최대 5문항씩 표시됩니다</div>
                  </div>
                  <div>{item.answered === item.total ? "✓" : "›"}</div>
                </div>
              </button>
            );
          })}
        </section>
      </aside>

      <div className="space-y-6">
        <section ref={questionTopRef} className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold text-slate-500">PAGE {currentPage + 1}</p>
              <h2 className="text-3xl font-black tracking-tight">{currentPageData?.section}</h2>
              <p className="mt-2 text-sm text-slate-500">같은 검사 영역의 문항만 최대 5개씩 표시됩니다.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">1점 전혀 아니다 · 5점 매우 그렇다</div>
          </div>

          <div className="space-y-4">
            {currentQuestions.map((q) => (
              <div key={q.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-700 ring-1 ring-slate-200">{q.id}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{q.section}</p>
                    <p className="font-bold leading-7">{q.text}</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {scale.map((value) => (
                    <button key={value} type="button" onClick={() => setAnswer(q.id, value)} className={`rounded-2xl border px-2 py-3 text-center transition ${answers[q.id] === value ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                      <div className="text-xl font-black">{value}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => movePage(currentPage - 1)} disabled={currentPage === 0} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
              이전 페이지
            </button>
            {currentPage < pages.length - 1 ? (
              <button type="button" onClick={() => movePage(currentPage + 1)} disabled={!currentPageDone} className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
                다음 5문항으로 이동
              </button>
            ) : (
              <div className={`rounded-2xl px-5 py-3 text-sm font-black ${isComplete ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-500"}`}>{isComplete ? "검사 완료 · 아래 결과 리포트를 확인하세요" : "마지막 페이지 문항에 모두 답하면 결과가 표시됩니다"}</div>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-500">RESULT REPORT</p>
            <h2 className="text-3xl font-black tracking-tight">통합 커리어 진단 결과</h2>
          </div>
          {!isComplete ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-500 ring-1 ring-slate-200">아직 결과를 계산하기에는 답변이 부족합니다.</div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-900 p-6 text-white">
                <p className="text-sm font-bold text-slate-300">나의 커리어 요약</p>
                <p className="mt-3 text-lg font-semibold leading-8">{result.summary}</p>
              </div>
              <div className="rounded-3xl border border-violet-200 bg-violet-50/90 p-6 ring-1 ring-violet-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-violet-900">AI 진단 해설</p>
                    <p className="mt-1 text-sm leading-6 text-violet-800">점수와 성향을 쉬운 말로 풀어 드리고, 다음에 무엇을 하면 좋을지 짚어 드립니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAiInsight}
                    disabled={aiLoading || Boolean(aiDiagnosis)}
                    className="shrink-0 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-violet-300"
                  >
                    {aiLoading ? "생성 중…" : aiDiagnosis ? "AI 진단 생성 완료" : "AI 진단 결과 생성하기"}
                  </button>
                </div>
                {aiInsightError ? <p className="mt-3 text-sm leading-6 text-rose-700">{aiInsightError}</p> : null}
                {typeof aiDiagnosis === "string" ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-violet-950">{aiDiagnosis}</p>
                ) : null}
                {aiDiagnosis?.interpretation ? (
                  <>
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-violet-950">{aiDiagnosis.interpretation}</p>
                    {Array.isArray(aiDiagnosis.tips) && aiDiagnosis.tips.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {aiDiagnosis.tips.map((t) => (
                          <li key={t} className="rounded-2xl bg-white/90 px-4 py-3 text-sm leading-6 text-violet-950 ring-1 ring-violet-100">
                            • {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : null}
                <p className="mt-3 text-xs leading-5 text-violet-700/90">
                  AI 기능은 서버에 OPENAI_API_KEY가 설정된 배포 환경에서 동작합니다. 로컬 전체 테스트 시에는 Vercel 개발 모드로 프론트와 API를 함께 실행하세요.
                </p>
              </div>
              <div className="grid gap-5 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="font-black">관심·선호 유형 TOP 3</h3>
                  <div className="mt-4 space-y-3">
                    {result.topRIASEC.map(([key, score], index) => (
                      <ScoreBar key={key} label={`${index + 1}. ${riasecLabels[key].name}`} value={pct(score)} description={riasecLabels[key].desc} />
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="font-black">성격 강점 TOP 3</h3>
                  <div className="mt-4 space-y-3">
                    {result.topPersonality.map(([key, score], index) => (
                      <ScoreBar key={key} label={`${index + 1}. ${key}`} value={pct(score)} description={personalityLabels[key]} />
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 p-5">
                  <h3 className="font-black">업무 강점 TOP 3</h3>
                  <div className="mt-4 space-y-3">
                    {result.topAptitude.map(([key, score], index) => (
                      <ScoreBar key={key} label={`${index + 1}. ${key}`} value={pct(score)} description={aptitudeLabels[key]} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 p-6">
                <h3 className="font-black">추천 직무 TOP 5</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {result.jobs.slice(0, 5).map((job, index) => (
                    <div key={job} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold ring-1 ring-slate-100">
                      {index + 1}. {job}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedReport(createDetailedReport(result, profile.value, feedback));
                      switchTab("basicReport");
                    }}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm"
                  >
                    베이직 리포트 보기
                  </button>
                  <button type="button" onClick={() => switchTab("coverLetter")} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black shadow-sm hover:bg-slate-100">
                    자기소개서 첨삭하기
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">베이직 리포트는 바로 확인할 수 있으며, PDF 저장은 MVP 사용 후기 조사 후 가능합니다.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/** html2canvas 캡처(한글·영문 유지) → jsPDF 다페이지 */
function appendCanvasToPdfMm(canvas, pdf, marginMm = 8) {
  const pageW = pdf.internal.pageSize.getWidth() - marginMm * 2;
  const pageH = pdf.internal.pageSize.getHeight() - marginMm * 2;
  const totalImgH_mm = (pageW * canvas.height) / canvas.width;
  const slicePx = Math.max(1, Math.ceil((canvas.height * pageH) / totalImgH_mm));

  let srcY = 0;
  let first = true;
  while (srcY < canvas.height) {
    if (!first) pdf.addPage();
    first = false;
    const sliceH = Math.min(slicePx, canvas.height - srcY);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;
    const sctx = sliceCanvas.getContext("2d");
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    const imgData = sliceCanvas.toDataURL("image/png", 0.92);
    const sliceH_mm = (pageW * sliceH) / canvas.width;
    pdf.addImage(imgData, "PNG", marginMm, marginMm, pageW, sliceH_mm);
    srcY += sliceH;
  }
}

function FeedbackSurveyPage({
  feedback,
  setFeedback,
  isComplete,
  result,
  profile,
  submissionId,
  setGeneratedReport,
  switchTab,
  aiDiagnosis,
  aiCoverLetterReview,
  generatedReport,
}) {
  const update = (field, value) => setFeedback((prev) => ({ ...prev, [field]: value }));
  const aiReportGenerated = Boolean(generatedReport?.ai);
  const canSubmit = isComplete && feedback.satisfaction && feedback.usefulness && feedback.easyToUse && feedback.recommend && feedback.paidIntent && feedback.improvement.trim() && !aiReportGenerated;

  const [submitBusy, setSubmitBusy] = useState(false);

  const generateAiReport = async () => {
    const fallback = createDetailedReport(result, profile, feedback);
    const aiReport = await callCareerAI({
      mode: "report",
      profile,
      result,
      feedback,
    });
    const aiData = aiReport?.data && typeof aiReport.data === "object" ? aiReport.data : {};
    return normalizeReportLanguage({
      ...fallback,
      createdAt: new Date().toLocaleDateString("ko-KR"),
      participant: profile,
      ai: true,
      title: aiData.title || fallback.title,
      summary: aiData.summary || fallback.summary,
      profileText: aiData.careerInterpretation || fallback.profileText,
      strengths: Array.isArray(aiData.strengths) && aiData.strengths.length > 0 ? aiData.strengths : fallback.strengths,
      recommendedJobs: Array.isArray(aiData.recommendedJobs) && aiData.recommendedJobs.length > 0 ? aiData.recommendedJobs : fallback.recommendedJobs,
      actionPlan: Array.isArray(aiData.actionPlan) && aiData.actionPlan.length > 0 ? aiData.actionPlan : fallback.actionPlan,
    });
  };

  const submitSurvey = async () => {
    if (!canSubmit || submitBusy) return;

    try {
      setSubmitBusy(true);

      if (!submissionId) {
        alert("저장 세션이 없습니다. 커리어 진단 탭에서 개인정보를 입력한 뒤 「진단 시작하기」로 1차 저장을 완료한 다음 다시 시도하세요.");
        return;
      }
      if (aiReportGenerated) {
        alert("AI 상세 리포트는 후기조사 완료 후 1회만 생성됩니다.");
        switchTab("basicReport");
        return;
      }

      const report = await generateAiReport();
      const ai = await fetchReportCoachSafe(report);
      const detailedReport = {
        ...report,
        aiCoach: ai.aiCoach,
        aiCoachError: ai.aiCoachError,
        aiCoachGeneratedAt: ai.aiCoachGeneratedAt,
      };

      await updateDiagnosisAfterFeedback(submissionId, {
        feedback,
        detailedReport,
        aiDiagnosis,
        aiReport: report,
        aiCoverLetterReview,
      });

      setGeneratedReport(detailedReport);
      switchTab("basicReport");
    } catch (error) {
      const msg = error?.message || String(error);
      const details = error?.details || error?.hint || "";
      console.error(error);
      alert(`AI 리포트 생성 또는 데이터 저장 중 오류가 발생했습니다.\n\n${msg}${details ? `\n${details}` : ""}\n\nVercel: Environment Variables(VITE_SUPABASE_*) 후 재배포. Supabase: patch_anon_select.sql·patch_answers_and_update.sql(RLS·UPDATE·answers).`);
    } finally {
      setSubmitBusy(false);
    }
  };

  if (!isComplete) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black">진단 완료 후 베이직 리포트를 볼 수 있습니다</h2>
          <p className="mt-3 leading-7 text-slate-600">베이직 리포트는 전체 진단을 완료하고 MVP 사용 후기 조사를 제출한 뒤 확인할 수 있습니다.</p>
          <button type="button" onClick={() => switchTab("diagnosis")} className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm">
            진단 완료하러 가기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-slate-300">MVP FEEDBACK SURVEY</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">PDF 저장 전 MVP 후기 조사</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-200">서비스 개선을 위해 짧은 후기를 남겨주세요. 제출 후 베이직 리포트 화면으로 돌아가 PDF 저장을 진행할 수 있습니다.</p>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField label="전체 만족도 *" value={feedback.satisfaction} onChange={(value) => update("satisfaction", value)} options={["매우 만족", "만족", "보통", "불만족", "매우 불만족"]} />
          <SelectField label="진단 결과가 도움이 되었나요? *" value={feedback.usefulness} onChange={(value) => update("usefulness", value)} options={["매우 도움됨", "도움됨", "보통", "도움 안 됨", "전혀 도움 안 됨"]} />
          <SelectField label="서비스 사용이 쉬웠나요? *" value={feedback.easyToUse} onChange={(value) => update("easyToUse", value)} options={["매우 쉬움", "쉬움", "보통", "어려움", "매우 어려움"]} />
          <SelectField label="주변에 추천할 의향이 있나요? *" value={feedback.recommend} onChange={(value) => update("recommend", value)} options={["적극 추천", "추천", "보통", "추천 어려움", "추천하지 않음"]} />
          <SelectField label="정식 출시 후 유료화된다면 사용할 의향이 있나요? *" value={feedback.paidIntent} onChange={(value) => update("paidIntent", value)} options={["유료라도 사용 의향 있음", "가격에 따라 사용 의향 있음", "무료라면 사용 의향 있음", "아직 잘 모르겠음", "사용 의향 없음"]} />
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">가장 좋았던 기능</span>
          <textarea value={feedback.bestFeature} onChange={(event) => update("bestFeature", event.target.value)} rows={4} placeholder="예: 진단 결과 요약, 추천 직무, 자기소개서 첨삭 등" className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-slate-900 focus:bg-white" />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">개선되었으면 하는 점 *</span>
          <textarea value={feedback.improvement} onChange={(event) => update("improvement", event.target.value)} rows={5} placeholder="사용하면서 불편했던 점, 추가되었으면 하는 기능, 이해하기 어려웠던 부분을 자유롭게 적어주세요." className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-slate-900 focus:bg-white" />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">추가로 원하는 서비스</span>
          <textarea value={feedback.desiredService} onChange={(event) => update("desiredService", event.target.value)} rows={4} placeholder="예: 면접 코칭, 직무별 리포트, 학교/전공별 추천, 자소서 문장 고도화 등" className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-slate-900 focus:bg-white" />
        </label>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-6 text-slate-500">* 표시 항목을 입력하면 베이직 리포트를 생성할 수 있습니다.</p>
          <button type="button" onClick={submitSurvey} disabled={!canSubmit || submitBusy} className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
            {submitBusy ? "저장 중(AI 코칭 포함)…" : aiReportGenerated ? "AI 상세 리포트 생성 완료" : "후기 제출하고 PDF 저장하러 가기"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          제출 시 GPT 기반 AI 리포트 코칭을 생성해 Supabase에 저장된 베이직 리포트(JSON)에 함께 넣습니다. OPENAI_API_KEY가 없으면 코칭 없이 리포트만 저장됩니다.
        </p>
      </section>
    </main>
  );
}

function BasicReportPage({ generatedReport, isComplete, switchTab, feedbackSubmitted }) {
  const report = useMemo(() => normalizeReportLanguage(generatedReport), [generatedReport]);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [aiCoach, setAiCoach] = useState(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachError, setAiCoachError] = useState("");

  useEffect(() => {
    if (!generatedReport) {
      setAiCoach(null);
      setAiCoachError("");
      return;
    }
    const r = normalizeReportLanguage(generatedReport);
    setAiCoach(r.aiCoach ?? null);
    setAiCoachError(r.aiCoachError || "");
  }, [generatedReport]);

  const fetchAiCoach = async () => {
    if (!report) return;
    const payload = buildReportCoachPayload(report);
    if (!payload) return;
    setAiCoachLoading(true);
    setAiCoachError("");
    try {
      const data = await callCareerAi("report_coach", payload);
      setAiCoach(data);
    } catch (err) {
      setAiCoachError(err.message || String(err));
    } finally {
      setAiCoachLoading(false);
    }
  };

  const handlePrintReport = async () => {
    if (!report) return;
    if (!feedbackSubmitted) {
      alert("PDF 저장 전 MVP 사용 후기 조사를 먼저 작성해주세요.");
      switchTab("feedback");
      return;
    }

    const el = document.getElementById("career-report-print-area");
    if (!el) {
      alert("PDF로 저장할 리포트 영역을 찾을 수 없습니다.");
      return;
    }

    try {
      setIsSavingPdf(true);
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const [jspdfModule, html2canvasMod] = await Promise.all([import("jspdf"), import("html2canvas")]);
      const JsPDF = jspdfModule.jsPDF || jspdfModule.default;
      const html2canvas = html2canvasMod.default;
      const pdf = new JsPDF({ orientation: "p", unit: "mm", format: "a4" });

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: Math.max(el.scrollWidth, 720),
        onclone: (_doc, cloned) => {
          cloned.querySelectorAll("button").forEach((btn) => {
            btn.style.setProperty("display", "none", "important");
          });
          const w = Math.max(cloned.scrollWidth, 720);
          cloned.style.width = `${w}px`;
          cloned.style.maxWidth = `${w}px`;
        },
      });

      appendCanvasToPdfMm(canvas, pdf, 8);

      const safeName = (report.participant?.name || "career-report").replace(/[^가-힣a-zA-Z0-9_-]/g, "_");
      pdf.save(`${safeName}_커리어_베이직리포트.pdf`);
    } catch (error) {
      console.error(error);
      alert("PDF 생성 중 오류가 발생했습니다. html2canvas·jsPDF 로그를 확인해주세요. 대안으로 브라우저 인쇄 기능을 실행합니다.");
      if (typeof window !== "undefined" && typeof window.print === "function") window.print();
    } finally {
      setIsSavingPdf(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <style>{`@media print { header, button { display: none !important; } body { background: white !important; } main { max-width: none !important; padding: 0 !important; } #career-report-print-area { display: block !important; } }`}</style>
      <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-slate-300">BASIC CAREER REPORT</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">베이직 리포트</h2>
        <p className="mt-4 max-w-3xl leading-7 text-slate-200">후기 조사를 제출한 뒤 자동 생성되는 개인 맞춤 커리어 리포트입니다.</p>
      </section>

      {!report ? (
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-xl font-black">아직 생성된 베이직 리포트가 없습니다</h3>
          <p className="mt-3 leading-7 text-slate-600">진단 결과 화면에서 베이직 리포트 보기 버튼을 누르고 MVP 사용 후기 조사를 제출하면 검사 결과를 기반으로 베이직 리포트가 자동 생성됩니다.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => switchTab("diagnosis")} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm">
              진단 결과에서 베이직 리포트 생성하기
            </button>
            {!isComplete ? (
              <button type="button" onClick={() => switchTab("diagnosis")} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black shadow-sm hover:bg-slate-100">
                진단 완료하기
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <div id="career-report-print-area" className="mt-6 space-y-5">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">생성일 {report.createdAt}</p>
                <h3 className="mt-1 text-2xl font-black">{report.title}</h3>
              </div>
              <button type="button" onClick={handlePrintReport} disabled={isSavingPdf} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
                {isSavingPdf ? "PDF 생성 중..." : "PDF 파일로 저장하기"}
              </button>
            </div>
            <p className="mt-4 leading-7 text-slate-700">{report.summary}</p>

            <div className="mt-5 rounded-3xl border border-violet-200 bg-violet-50/90 p-6 ring-1 ring-violet-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-violet-900">AI 리포트 코칭</p>
                  <p className="mt-1 text-sm leading-6 text-violet-800">베이직 리포트 내용을 바탕으로 지원·면접 준비 관점에서 코칭을 덧붙입니다.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchAiCoach}
                  disabled={aiCoachLoading}
                  className="shrink-0 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-violet-300"
                >
                  {aiCoachLoading ? "생성 중…" : aiCoach ? "AI 다시 받기" : "AI 코칭 받기"}
                </button>
              </div>
              {aiCoachError ? <p className="mt-3 text-sm leading-6 text-rose-700">{aiCoachError}</p> : null}
              {aiCoach ? (
                <div className="mt-4 space-y-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-violet-950">{aiCoach.openingReflection}</p>
                  {Array.isArray(aiCoach.emphasisForApplications) && aiCoach.emphasisForApplications.length > 0 ? (
                    <div>
                      <p className="text-sm font-black text-violet-900">지원 시 강조하면 좋은 점</p>
                      <ul className="mt-2 space-y-2">
                        {aiCoach.emphasisForApplications.map((t) => (
                          <li key={t} className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-violet-950 ring-1 ring-violet-100">
                            • {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {aiCoach.oneWeekFocus ? (
                    <div>
                      <p className="text-sm font-black text-violet-900">이번 주 집중하면 좋은 일</p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-violet-950">{aiCoach.oneWeekFocus}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-black">참여자 정보</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">이름: {report.participant?.name || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">상태: {report.participant?.status || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">학교: {report.participant?.school || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">전공: {report.participant?.major || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">학점: {report.participant?.gpa || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">희망직무: {report.participant?.targetJob || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">자격증: {report.participant?.certificates || "-"}</p>
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold ring-1 ring-slate-100">어학성적: {report.participant?.languageScores || "-"}</p>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">1. 쉽게 보는 나의 진로 성향</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{report.profileText}</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">2. 진로·취업 준비 단계</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{report.stage}</p>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">3. 나의 핵심 강점</h3>
              <div className="mt-4 space-y-3">
                {report.strengths.map((item, i) => (
                  <p key={`strength-${i}`} className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 ring-1 ring-emerald-100">
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">4. 추천 직무 TOP 5</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {report.recommendedJobs.slice(0, 5).map((job, index) => {
                  const title = typeof job === "string" ? job : job.title;
                  const tip = typeof job === "object" && job.tip ? job.tip : null;
                  return (
                    <div key={`${title}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                      <div className="text-sm font-bold">
                        {index + 1}. {title}
                      </div>
                      {tip ? <p className="mt-2 text-xs leading-6 text-slate-600">{tip}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-black">5. 다음 실행전략</h3>
            <ol className="mt-4 space-y-3">
              {report.actionPlan.map((item, index) => (
                <li key={`action-${index}`} className="rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950 ring-1 ring-indigo-100">
                  <strong>{index + 1}단계.</strong> {item}
                </li>
              ))}
            </ol>
          </section>

          {Array.isArray(report.weeklyChecklist) && report.weeklyChecklist.length > 0 ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-black">6. 이번주 취업준비 체크리스트</h3>
              <ul className="mt-4 space-y-3">
                {report.weeklyChecklist.map((item, index) => (
                  <li key={`check-${index}`} className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 ring-1 ring-amber-100">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}

function CoverLetterPage({ result, isComplete, profile, aiCoverLetterReview, setAiCoverLetterReview, aiCoverLetterLoading, setAiCoverLetterLoading }) {
  const initialItems = [1, 2, 3, 4].map((id) => ({ id, question: "", answer: "" }));
  const [coverLetter, setCoverLetter] = useState({ company: "", job: profile.targetJob || "", items: initialItems });

  const updateBase = (field, value) => {
    setCoverLetter((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setCoverLetter((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const reviews = useMemo(() => {
    return coverLetter.items.map((item) => ({
      id: item.id,
      review: buildCoverLetterReview(item, coverLetter.company, coverLetter.job, result, isComplete),
    }));
  }, [coverLetter, result, isComplete]);

  const completedReviews = reviews.filter((item) => item.review);
  const averageScore = completedReviews.length ? Math.round(completedReviews.reduce((sum, item) => sum + item.review.total, 0) / completedReviews.length) : null;
  const totalLength = coverLetter.items.reduce((sum, item) => sum + item.answer.trim().length, 0);

  const [aiByItem, setAiByItem] = useState({});

  const runAiCoverLetterReview = async () => {
    if (aiCoverLetterReview) return;
    try {
      setAiCoverLetterLoading(true);
      const aiReview = await callCareerAI({
        mode: "coverLetter",
        profile,
        result,
        coverLetter,
      });
      setAiCoverLetterReview(aiReview.data || aiReview.raw);
    } catch (error) {
      alert("AI 자기소개서 첨삭 중 오류가 발생했습니다.");
    } finally {
      setAiCoverLetterLoading(false);
    }
  };

  const runAiCover = async (itemId) => {
    if (aiCoverLetterReview) return;
    const row = coverLetter.items.find((x) => x.id === itemId);
    if (!row?.answer?.trim()) return;
    setAiByItem((prev) => ({ ...prev, [itemId]: { loading: true, error: "" } }));
    try {
      const rev = buildCoverLetterReview(row, coverLetter.company, coverLetter.job, result, isComplete);
      const ruleHint = rev ? `규칙 기반 총점 ${rev.total}. 보완: ${rev.improvements.join("; ") || "없음"}` : "";
      const diagnosisHint =
        isComplete && result.topRIASEC?.length > 0
          ? `진단 상위 관심유형: ${result.topRIASEC.map(([k]) => riasecLabels[k]?.name).filter(Boolean).join(", ")}`
          : "";
      const data = await callCareerAi("cover_letter", {
        company: coverLetter.company,
        job: coverLetter.job,
        question: row.question,
        answer: row.answer,
        ruleBasedHint: ruleHint,
        diagnosisHint,
      });
      setAiByItem((prev) => ({ ...prev, [itemId]: { loading: false, data } }));
    } catch (err) {
      setAiByItem((prev) => ({ ...prev, [itemId]: { loading: false, error: err.message || String(err) } }));
    }
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[420px_1fr]">
      <aside className="space-y-5">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-bold text-slate-500">SELF-INTRO REVIEW</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">자기소개서 첨삭</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">지원 회사와 직무를 입력한 뒤, 자기소개서 문항과 답변을 최대 4개까지 첨삭할 수 있습니다.</p>
          <div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ring-1 ${isComplete ? "bg-emerald-50 text-emerald-900 ring-emerald-100" : "bg-amber-50 text-amber-900 ring-amber-100"}`}>{isComplete ? "커리어 진단 결과가 첨삭에 함께 반영됩니다." : "현재는 기본 첨삭 모드입니다. 커리어 진단을 완료하면 맞춤 첨삭으로 고도화됩니다."}</div>
        </section>

        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="font-black">첨삭 현황</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs font-bold text-slate-300">입력 문항</div>
              <div className="mt-1 text-3xl font-black">{completedReviews.length}/4</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-xs font-bold text-slate-300">평균 점수</div>
              <div className="mt-1 text-3xl font-black">{averageScore ? `${averageScore}점` : "-"}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">총 입력 글자 수: {totalLength}자</p>
        </section>
      </aside>

      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-500">BASIC INFO</p>
            <h2 className="text-3xl font-black tracking-tight">지원 정보 입력</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="지원 회사" value={coverLetter.company} onChange={(value) => updateBase("company", value)} placeholder="예: 삼성전자, 한국전력공사" />
            <InputField label="지원 직무" value={coverLetter.job} onChange={(value) => updateBase("job", value)} placeholder="예: 인사, 영업관리, 행정" />
          </div>
          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={runAiCoverLetterReview}
              disabled={aiCoverLetterLoading || Boolean(aiCoverLetterReview)}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {aiCoverLetterLoading ? "생성 중…" : aiCoverLetterReview ? "AI 첨삭 생성 완료" : "AI 자기소개서 첨삭하기"}
            </button>
          </div>
        </section>

        {aiCoverLetterReview ? (
          <section className="rounded-3xl border border-violet-200 bg-violet-50/90 p-6 ring-1 ring-violet-100">
            <p className="text-sm font-black text-violet-900">AI 자기소개서 첨삭 결과</p>
            {typeof aiCoverLetterReview === "string" ? <p className="mt-3 whitespace-pre-line text-sm leading-7 text-violet-950">{aiCoverLetterReview}</p> : null}
            {typeof aiCoverLetterReview === "object" && aiCoverLetterReview ? (
              <div className="mt-4 space-y-4">
                {aiCoverLetterReview.overallComment ? (
                  <div>
                    <p className="text-sm font-bold text-violet-900">전체 총평</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-violet-950">{aiCoverLetterReview.overallComment}</p>
                  </div>
                ) : null}
                {Array.isArray(aiCoverLetterReview.items) && aiCoverLetterReview.items.length > 0 ? (
                  <div className="space-y-3">
                    {aiCoverLetterReview.items.map((item, index) => (
                      <div key={`ai-item-${item.questionNo || index}`} className="rounded-2xl bg-white/90 p-4 ring-1 ring-violet-100">
                        <p className="text-sm font-black text-violet-900">문항 {item.questionNo || "-"}</p>
                        {item.diagnosisBasedAdvice ? <p className="mt-2 text-sm leading-7 text-violet-950">{item.diagnosisBasedAdvice}</p> : null}
                        {item.sampleRevision ? (
                          <div className="mt-3 rounded-xl bg-violet-50 p-3 text-sm leading-7 text-violet-950 ring-1 ring-violet-100">{item.sampleRevision}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {coverLetter.items.map((item) => {
          const currentReview = reviews.find((reviewItem) => reviewItem.id === item.id)?.review;
          return (
            <section key={item.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">QUESTION {item.id}</p>
                  <h3 className="text-2xl font-black tracking-tight">자기소개서 문항 {item.id}</h3>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">답변 {item.answer.trim().length}자</div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">문항 {item.id}</span>
                <input value={item.question} onChange={(event) => updateItem(item.id, "question", event.target.value)} placeholder={`예: 자기소개서 ${item.id}번 문항을 입력해주세요.`} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white" />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-bold text-slate-700">답변 {item.id}</span>
                <textarea value={item.answer} onChange={(event) => updateItem(item.id, "answer", event.target.value)} placeholder={`첨삭받고 싶은 ${item.id}번 답변을 붙여넣어 주세요.`} rows={10} className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 outline-none transition focus:border-slate-900 focus:bg-white" />
              </label>

              {!currentReview ? (
                <div className="mt-5 rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">{item.id}번 답변을 입력하면 첨삭 결과가 표시됩니다.</div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="rounded-3xl bg-slate-900 p-6 text-white">
                    <p className="text-sm font-bold text-slate-300">문항 {item.id} 첨삭 점수</p>
                    <div className="mt-2 text-5xl font-black">{currentReview.total}점</div>
                    <p className="mt-3 text-sm leading-6 text-slate-200">현재 답변은 {currentReview.length}자입니다.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {Object.entries(currentReview.scores).map(([key, value]) => (
                      <ScoreBar key={key} label={key} value={value} />
                    ))}
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-6">
                      <h4 className="font-black">좋은 점</h4>
                      <ul className="mt-4 space-y-3">
                        {currentReview.strengths.map((text) => (
                          <li key={text} className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 ring-1 ring-emerald-100">
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-6">
                      <h4 className="font-black">보완할 점</h4>
                      <ul className="mt-4 space-y-3">
                        {currentReview.improvements.length ? (
                          currentReview.improvements.map((text) => (
                            <li key={text} className="rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-900 ring-1 ring-rose-100">
                              {text}
                            </li>
                          ))
                        ) : (
                          <li className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">기본 구성은 양호합니다. 직무 키워드와 회사 맞춤 문장을 더 정교하게 다듬어보세요.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-6">
                    <h4 className="font-black">진단 결과 기반 맞춤 첨삭 포인트</h4>
                    <div className="mt-4 space-y-3">
                      {currentReview.guides.map((text) => (
                        <p key={text} className="rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-950 ring-1 ring-indigo-100">
                          {text}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-6">
                      <h4 className="font-black">추천 수정 구조</h4>
                      <ol className="mt-4 space-y-3">
                        {currentReview.structure.map((text, index) => (
                          <li key={text} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
                            <strong>{index + 1}.</strong> {text}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-6">
                      <h4 className="font-black">문장 수정 예시</h4>
                      <div className="mt-4 whitespace-pre-line rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-white">{currentReview.sampleDraft}</div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-violet-200 bg-violet-50/90 p-6 ring-1 ring-violet-100">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-violet-900">GPT 첨삭</p>
                        <p className="mt-1 text-sm leading-6 text-violet-800">위 규칙 기반 첨삭에 더해 문단 단위 코멘트와 수정 예시를 받을 수 있습니다.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => runAiCover(item.id)}
                        disabled={Boolean(aiByItem[item.id]?.loading) || Boolean(aiCoverLetterReview)}
                        className="shrink-0 rounded-2xl bg-violet-700 px-5 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-violet-300"
                      >
                        {aiByItem[item.id]?.loading ? "생성 중…" : aiCoverLetterReview ? "AI 첨삭 생성 완료" : aiByItem[item.id]?.data ? "GPT 다시 받기" : "GPT 첨삭 받기"}
                      </button>
                    </div>
                    {aiByItem[item.id]?.error ? <p className="mt-3 text-sm leading-6 text-rose-700">{aiByItem[item.id].error}</p> : null}
                    {aiByItem[item.id]?.data ? (
                      <div className="mt-4 space-y-4">
                        <p className="text-sm font-bold text-violet-900">총평</p>
                        <p className="text-sm leading-7 text-violet-950">{aiByItem[item.id].data.overallFeedback}</p>
                        {Array.isArray(aiByItem[item.id].data.strengths) && aiByItem[item.id].data.strengths.length > 0 ? (
                          <div>
                            <p className="text-sm font-bold text-violet-900">강점</p>
                            <ul className="mt-2 space-y-2">
                              {aiByItem[item.id].data.strengths.map((t) => (
                                <li key={t} className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-violet-950 ring-1 ring-violet-100">
                                  • {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {Array.isArray(aiByItem[item.id].data.improvements) && aiByItem[item.id].data.improvements.length > 0 ? (
                          <div>
                            <p className="text-sm font-bold text-violet-900">보완</p>
                            <ul className="mt-2 space-y-2">
                              {aiByItem[item.id].data.improvements.map((t) => (
                                <li key={t} className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-violet-950 ring-1 ring-violet-100">
                                  • {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {aiByItem[item.id].data.revisedSample ? (
                          <div>
                            <p className="text-sm font-bold text-violet-900">수정 예시 문단</p>
                            <div className="mt-2 whitespace-pre-line rounded-2xl bg-white/95 p-4 text-sm leading-7 text-violet-950 ring-1 ring-violet-100">{aiByItem[item.id].data.revisedSample}</div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

export default function CareerDiagnosisMVP() {
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCoverLetterReview, setAiCoverLetterReview] = useState(null);
  const [aiCoverLetterLoading, setAiCoverLetterLoading] = useState(false);
  const [feedback, setFeedback] = useState(emptyFeedback);
  const [profile, setProfile] = useState(emptyProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [startBusy, setStartBusy] = useState(false);
  const appTopRef = useRef(null);
  const isComplete = Object.keys(answers).length === questions.length;
  const feedbackSubmitted = Boolean(feedback.satisfaction && feedback.usefulness && feedback.easyToUse && feedback.recommend && feedback.paidIntent && feedback.improvement.trim());

  const result = useMemo(() => {
    const interest = computeScores(answers, "interest");
    const personality = computeScores(answers, "personality");
    const aptitude = computeScores(answers, "aptitude");
    const maturity = computeScores(answers, "maturity");
    const readiness = computeScores(answers, "readiness");
    const maturityAvg = average(Object.values(maturity));
    const readinessAvg = average(Object.values(readiness));
    const topRIASEC = topEntries(interest, 3);
    const topPersonality = topEntries(personality, 3);
    const topAptitude = topEntries(aptitude, 3);
    const level = getReadinessLevel(maturityAvg, readinessAvg);
    const jobs = [...new Set(topRIASEC.flatMap(([key]) => jobMap[key] || []))].slice(0, 5);
    const names = topRIASEC.map(([key]) => riasecLabels[key]?.name).filter(Boolean).join(" + ");
    const topPersonalityName = topPersonality[0]?.[0] || "성격 강점";
    const topAptitudeName = topAptitude[0]?.[0] || "업무 강점";
    const summary = `${profile.name ? `${profile.name}님, ` : ""}검사 기준으로는 ${names || "진단 완료 후 표시"} 성향이 먼저 드러나요. ${topPersonalityName} 성향과 ${topAptitudeName} 역량을 직무에 연결해 말할 수 있으면 서류·면접에서 설득력이 올라갑니다. 지금은 '${level.label}' 구간에 가깝게 보여요.`;
    return { interest, personality, aptitude, maturityAvg, readinessAvg, topRIASEC, topPersonality, topAptitude, level, jobs, summary };
  }, [answers, profile.name]);

  const answersRef = useRef(answers);
  const resultRef = useRef(result);
  answersRef.current = answers;
  resultRef.current = result;

  useEffect(() => {
    if (!isComplete || !submissionId) return;
    try {
      if (sessionStorage.getItem(phase2SessionKey(submissionId))) return;
    } catch {
      /* ignore */
    }

    let cancelled = false;

    (async () => {
      try {
        await updateDiagnosisAfterQuestions(submissionId, {
          answers: answersRef.current,
          result: resultRef.current,
        });
        if (!cancelled) {
          try {
            sessionStorage.setItem(phase2SessionKey(submissionId), "1");
          } catch {
            /* ignore */
          }
        }
      } catch (error) {
        if (!cancelled) {
          const msg = error?.message || String(error);
          console.error(error);
          alert(`2차 저장(문항·결과)에 실패했습니다.\n\n${msg}\n\nSupabase에서 UPDATE 정책·grant 및 answers 컬럼(patch_answers_and_update.sql, patch_anon_select.sql)을 확인하세요.`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isComplete, submissionId]);

  const handleStartDiagnosis = async () => {
    if (startBusy) return;
    setStartBusy(true);
    try {
      if (submissionId) {
        await updateDiagnosisProfile(submissionId, profile);
      } else {
        const row = await insertDiagnosisProfile(profile);
        const id = row?.id;
        if (id) setSubmissionId(id);
      }
      setProfileReady(true);
    } catch (error) {
      const msg = error?.message || String(error);
      const details = error?.details || error?.hint || "";
      console.error(error);
      alert(`1차 저장에 실패했습니다.\n\n${msg}${details ? `\n${details}` : ""}\n\nVercel이면 VITE_SUPABASE_* 환경 변수 후 재배포. Supabase는 patch_anon_select.sql(INSERT·SELECT)을 실행했는지 확인하세요.`);
    } finally {
      setStartBusy(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setTimeout(() => appTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const resetAll = () => {
    try {
      if (submissionId) sessionStorage.removeItem(phase2SessionKey(submissionId));
    } catch {
      /* ignore */
    }
    setSubmissionId(null);
    setAnswers({});
    setGeneratedReport(null);
    setAiDiagnosis(null);
    setAiLoading(false);
    setAiCoverLetterReview(null);
    setAiCoverLetterLoading(false);
    setFeedback(emptyFeedback);
    setProfile(emptyProfile);
    setProfileReady(false);
    switchTab("diagnosis");
  };

  return (
    <div ref={appTopRef} className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">AI 커리어 프로파일 진단 MVP</h1>
            <p className="mt-1 text-sm text-slate-500">개인정보 입력 · 검사별 5문항 진단 · 후기 조사 후 베이직 리포트 · 자기소개서 첨삭(GPT 선택)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => switchTab("diagnosis")} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === "diagnosis" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white hover:bg-slate-100"}`}>
              커리어 진단
            </button>
            <button type="button" onClick={() => switchTab("coverLetter")} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === "coverLetter" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white hover:bg-slate-100"}`}>
              자기소개서 첨삭
            </button>
            <button type="button" onClick={() => switchTab("basicReport")} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === "basicReport" ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white hover:bg-slate-100"}`}>
              베이직 리포트
            </button>
            <button type="button" onClick={resetAll} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-slate-100">
              초기화
            </button>
          </div>
        </div>
      </header>

      {activeTab === "diagnosis" ? (
        <DiagnosisPage
          answers={answers}
          setAnswers={setAnswers}
          result={result}
          isComplete={isComplete}
          switchTab={switchTab}
          profile={{ value: profile, set: setProfile }}
          profileReady={profileReady}
          setProfileReady={setProfileReady}
          setGeneratedReport={setGeneratedReport}
          feedback={feedback}
          onStartDiagnosis={handleStartDiagnosis}
          startBusy={startBusy}
          aiDiagnosis={aiDiagnosis}
          setAiDiagnosis={setAiDiagnosis}
          aiLoading={aiLoading}
          setAiLoading={setAiLoading}
        />
      ) : null}
      {activeTab === "feedback" ? (
        <FeedbackSurveyPage
          feedback={feedback}
          setFeedback={setFeedback}
          isComplete={isComplete}
          result={result}
          profile={profile}
          submissionId={submissionId}
          setGeneratedReport={setGeneratedReport}
          switchTab={switchTab}
          aiDiagnosis={aiDiagnosis}
          aiCoverLetterReview={aiCoverLetterReview}
          generatedReport={generatedReport}
        />
      ) : null}
      {activeTab === "basicReport" ? <BasicReportPage generatedReport={generatedReport} isComplete={isComplete} switchTab={switchTab} feedbackSubmitted={feedbackSubmitted} /> : null}
      {activeTab === "coverLetter" ? (
        <CoverLetterPage
          result={result}
          isComplete={isComplete}
          profile={profile}
          aiCoverLetterReview={aiCoverLetterReview}
          setAiCoverLetterReview={setAiCoverLetterReview}
          aiCoverLetterLoading={aiCoverLetterLoading}
          setAiCoverLetterLoading={setAiCoverLetterLoading}
        />
      ) : null}
    </div>
  );
}
