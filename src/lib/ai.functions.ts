import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(messages: Array<{ role: string; content: string }>, model = "google/gemini-3-flash-preview") {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) {
    throw new Error("AI service not configured");
  }

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI gateway error:", response.status, text);
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
  explanation: z.string(),
});

const quizResponseSchema = z.object({
  questions: z.array(quizQuestionSchema).length(10),
});

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { subject: string; topic: string }) => data)
  .handler(async ({ data }) => {
    const systemPrompt = `You are ExamPass AI — a calm, highly intelligent, strategic exam-question writer for Namibia NSSCO. Tone: precise, slightly cold, never warm. No filler, no encouragement, no emojis. Generate exactly 10 multiple-choice exam questions.

Strict rules:
- Each question must have exactly 4 options (A, B, C, D)
- NSSCO Grade 11–12 level, exam-grade phrasing
- Include the correct answer index (0–3)
- Explanation: one short, direct sentence — no padding, no encouragement
- Return ONLY valid JSON, no markdown, no commentary:

{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}`;

    const userPrompt = `Generate 10 NSSCO exam questions for ${data.subject} on the topic: ${data.topic}. Make them challenging but fair for a Grade 11-12 student.`;

    const content = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    try {
      const parsed = JSON.parse(content);
      const result = quizResponseSchema.parse(parsed);
      return { questions: result.questions };
    } catch (e) {
      console.error("Failed to parse AI quiz response:", content);
      throw new Error("Failed to generate quiz. Please try again.");
    }
  });

export const explainAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { question: string; correctAnswer: string; subject: string; topic: string }) => data)
  .handler(async ({ data }) => {
    const prompt = `NSSCO ${data.subject} — ${data.topic}.

Question: "${data.question}"
Correct answer: "${data.correctAnswer}"

Respond in exactly this structure, no headings, no fluff:
1. Direct answer (one sentence: state why it is correct).
2. Breakdown (2–4 short lines, plain reasoning).
3. Strategic insight (one line: a shortcut, common trap, or pattern to remember).

Tone: calm, intelligent, slightly cold, straight to the point. Do not praise the student. Do not exceed 160 words.`;

    const explanation = await callAI([
      { role: "system", content: "You are ExamPass AI: a strict, brilliant mentor for NSSCO students. Sharp, precise, never warm. You make students think — you do not coddle." },
      { role: "user", content: prompt },
    ]);

    return { explanation };
  });

export const chatWithSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messages: Array<{ role: string; content: string }>; subject: string; topic: string }) => data)
  .handler(async ({ data }) => {
    const systemPrompt = `You are ExamPass AI — a calm, highly intelligent, strategic tutor for Namibian NSSCO ${data.subject}, currently on the topic: ${data.topic}.

Persona:
- Disciplined, precise, slightly cold but helpful.
- Never over-explain. Never praise. No emojis. No filler ("great question", "of course", "happy to help").
- Guide step-by-step. Make the student think — ask one short probing question when useful.
- Occasionally challenge the student briefly ("Think carefully. The mistake here is obvious once you notice this…").

Strict rules:
- Only answer questions strictly within ${data.subject} → ${data.topic}.
- If the user drifts off-topic, respond exactly with a single line redirect, e.g.: "Focus. That question is outside your selected topic." Then stop.
- Answers: short direct point first, then a clean breakdown, then (when relevant) one strategic insight or shortcut.
- Keep responses tight. No padding.`;

    const response = await callAI([
      { role: "system", content: systemPrompt },
      ...data.messages,
    ]);

    return { response };
  });

export const summarizePDF = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { text: string; subject: string }) => data)
  .handler(async ({ data }) => {
    const prompt = `Summarize this ${data.subject} material into clean, exam-focused key points. Structured bullets only. No filler, no encouragement. End with one short "Strategic focus:" line naming what the student should prioritise.

${data.text.slice(0, 8000)}`;

    const summary = await callAI([
      { role: "system", content: "You are ExamPass AI: a strict, brilliant NSSCO mentor. Calm, precise, slightly cold. No filler." },
      { role: "user", content: prompt },
    ]);

    return { summary };
  });

export const generateQuizFromPDF = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { text: string; subject: string; topic: string }) => data)
  .handler(async ({ data }) => {
    const systemPrompt = `You are an expert exam question writer for Namibia NSSCO level. Generate exactly 10 multiple-choice exam questions based on the provided text.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Questions should be exam-style and appropriate for NSSCO level
- Include the correct answer index (0-3)
- Provide a brief explanation for the correct answer
- Return ONLY valid JSON in this exact format:

{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}

Do not include any markdown formatting, just raw JSON.`;

    const userPrompt = `Generate 10 NSSCO exam questions for ${data.subject} on ${data.topic} based on this text:\n\n${data.text.slice(0, 8000)}`;

    const content = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    try {
      const parsed = JSON.parse(content);
      const result = quizResponseSchema.parse(parsed);
      return { questions: result.questions };
    } catch (e) {
      console.error("Failed to parse AI PDF quiz response:", content);
      throw new Error("Failed to generate quiz from PDF. Please try again.");
    }
  });
