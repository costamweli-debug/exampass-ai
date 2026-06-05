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
      temperature: 0.7,
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
    const systemPrompt = `You are an expert exam question writer for Namibia NSSCO level. Generate exactly 10 multiple-choice exam questions.

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
    const prompt = `Explain why "${data.correctAnswer}" is the correct answer to this NSSCO ${data.subject} question on ${data.topic}:

"${data.question}"

Give a clear, student-friendly explanation that helps them understand the concept. Keep it under 200 words.`;

    const explanation = await callAI([
      { role: "system", content: "You are a helpful tutor explaining exam answers to Namibian NSSCO students." },
      { role: "user", content: prompt },
    ]);

    return { explanation };
  });

export const chatWithSubject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { messages: Array<{ role: string; content: string }>; subject: string; topic: string }) => data)
  .handler(async ({ data }) => {
    const systemPrompt = `You are ExamPass AI, a helpful tutor for Namibian NSSCO ${data.subject} students. You are currently discussing the topic: ${data.topic}.

Rules:
- Only answer questions related to ${data.subject} and ${data.topic}
- If the user asks about something unrelated, politely redirect them back to ${data.subject} / ${data.topic}
- Use clear, student-friendly language
- Include examples when helpful
- Keep responses concise but informative`;

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
    const prompt = `Summarize the following ${data.subject} exam paper or notes into key points a student should study. Keep it structured and concise:

${data.text.slice(0, 8000)}`;

    const summary = await callAI([
      { role: "system", content: "You are an expert tutor summarizing exam papers for NSSCO students." },
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
