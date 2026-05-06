export async function callCareerAI(payload) {
  const response = await fetch("/api/ai-career", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("AI API 호출에 실패했습니다.");
  }

  return response.json();
}
