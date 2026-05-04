import { supabase } from "./supabase";

function requireClient() {
  if (!supabase) {
    throw new Error(
      "Supabase 환경 변수가 없습니다. 로컬: .env.local 의 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 저장 후 dev 재시작. Vercel: Project → Settings → Environment Variables 에 동일 이름으로 값을 넣고 재배포(Redeploy) 하세요."
    );
  }
}

function profileColumns(profile) {
  return {
    name: profile.name || null,
    email: profile.email || null,
    phone: profile.phone || null,
    age_group: profile.ageGroup || null,
    status: profile.status || null,
    education: profile.education || null,
    school: profile.school || null,
    major: profile.major || null,
    gpa: profile.gpa || null,
    certificates: profile.certificates || null,
    language_scores: profile.languageScores || null,
    target_job: profile.targetJob || null,
    target_company_type: profile.targetCompanyType || null,
    region: profile.region || null,
    referral: profile.referral || null,
    privacy_consent: Boolean(profile.privacyConsent),
    marketing_consent: Boolean(profile.marketingConsent),
  };
}

/** 1차: 진단 시작 시 프로필만 INSERT */
export async function insertDiagnosisProfile(profile) {
  requireClient();
  const payload = {
    ...profileColumns(profile),
    answers: {},
    result: {},
    detailed_report: {},
    feedback: null,
  };

  const { data, error } = await supabase.from("diagnosis_submissions").insert(payload).select("id").single();

  if (error) {
    console.error("Supabase 1차 저장 오류:", error);
    throw error;
  }
  return data;
}

/** 정보 수정 후 다시 시작: 동일 행 프로필만 갱신 */
export async function updateDiagnosisProfile(submissionId, profile) {
  requireClient();
  const { data, error } = await supabase
    .from("diagnosis_submissions")
    .update(profileColumns(profile))
    .eq("id", submissionId)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase 프로필 갱신 오류:", error);
    throw error;
  }
  return data;
}

/** 2차: 45문항 완료 시 answers + result */
export async function updateDiagnosisAfterQuestions(submissionId, { answers, result }) {
  requireClient();
  const { data, error } = await supabase
    .from("diagnosis_submissions")
    .update({
      answers: JSON.parse(JSON.stringify(answers)),
      result: JSON.parse(JSON.stringify(result)),
    })
    .eq("id", submissionId)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase 2차 저장 오류:", error);
    throw error;
  }
  return data;
}

/** 후기 제출: feedback + detailed_report (동일 행) */
export async function updateDiagnosisAfterFeedback(submissionId, { feedback, detailedReport }) {
  requireClient();
  const { data, error } = await supabase
    .from("diagnosis_submissions")
    .update({
      feedback: JSON.parse(JSON.stringify(feedback)),
      detailed_report: JSON.parse(JSON.stringify(detailedReport)),
    })
    .eq("id", submissionId)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase 후기 저장 오류:", error);
    throw error;
  }
  return data;
}
