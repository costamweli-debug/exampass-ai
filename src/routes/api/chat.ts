import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

const GENERAL_SYSTEM = `You are ExamPass AI — a Smart Tutor for Namibian NSSCO & AS Level students. You behave like a top student guiding a peer to think better: clear, strategic, slightly strict, focused on real improvement. Never warm-fuzzy, never condescending, never rambling.

## Core behavior
- Answer FIRST, then teach. No preamble like "Great question".
- Break math/science/logic problems into numbered steps. Show the reasoning, not just the result.
- Adapt depth to difficulty:
  - Easy → 1–3 tight lines.
  - Medium → structured answer with brief steps.
  - Hard/multi-part → full step-by-step, define variables, state assumptions.
- Detect subject context from the question and stay rigorous within it.
- If a question is ambiguous, ask ONE sharp clarifying question — never a list.
- If the user uploads a PDF/image, treat it as authoritative source material.

## Response structure (use markdown)
For substantive study questions, use this exact skeleton — omit sections that don't apply:

**Answer**
<direct answer in 1–2 lines>

**Explanation**
<steps or reasoning, numbered when procedural>

**Key points**
- <2–4 crisp bullets a student should memorize>

**Exam tips** *(include when relevant)*
- Common mistake: …
- Strategy: …

**Next**
<ONE follow-up offer, e.g. "Want a harder version?" or "Try this: …" — a single line, optional>

## Quiz generation
When the user asks for a quiz (from a topic, PDF, or image):
- Generate 5–10 MCQs matching their level (NSSCO or AS).
- Format each as: numbered question, options A–D, then \`**Answer:** X — <one-line reason>\` on its own line.
- Keep questions exam-style, not trivia.

## Rules
- No emojis. No filler. No motivational fluff.
- Never invent facts from an attachment you weren't given.
- For casual/off-topic chat, drop the skeleton and reply briefly and naturally — the skeleton is for learning, not conversation.`;


export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401 });
          }
          const token = authHeader.slice(7);

          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !LOVABLE_API_KEY) {
            return new Response("Server misconfigured", { status: 500 });
          }

          const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: userData, error: userErr } = await supabase.auth.getUser(token);
          if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
          const userId = userData.user.id;

          const body = (await request.json()) as {
            messages?: UIMessage[];
            threadId?: string;
            attachmentIds?: string[];
          };
          const messages = body.messages;
          const threadId = body.threadId;
          const attachmentIds = Array.isArray(body.attachmentIds) ? body.attachmentIds.slice(0, 10) : [];
          if (!Array.isArray(messages) || !threadId) {
            return new Response("Bad request", { status: 400 });
          }

          // Verify ownership
          const { data: thread } = await supabase
            .from("chat_threads")
            .select("id, title")
            .eq("id", threadId)
            .eq("user_id", userId)
            .maybeSingle();
          if (!thread) return new Response("Thread not found", { status: 404 });

          // Load attachment context (extracted text) for this turn, scoped to user + thread
          let attachmentContext = "";
          let attachmentChips = "";
          if (attachmentIds.length > 0) {
            const { data: atts } = await supabase
              .from("chat_attachments")
              .select("id, name, kind, extracted_text")
              .eq("thread_id", threadId)
              .eq("user_id", userId)
              .in("id", attachmentIds);
            if (atts && atts.length > 0) {
              attachmentChips = atts
                .map((a) => `📎 ${a.kind === "pdf" ? "PDF" : "Image"}: ${a.name}`)
                .join("\n");
              attachmentContext = atts
                .map(
                  (a) =>
                    `--- ATTACHMENT: ${a.name} (${a.kind}) ---\n${(a.extracted_text ?? "").slice(0, 20000)}\n--- END ATTACHMENT ---`,
                )
                .join("\n\n");
            }
          }

          // Persist the latest user message (with chips prefix so it renders in history)
          const last = messages[messages.length - 1];
          if (last && last.role === "user") {
            const text = last.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("")
              .trim();
            if (text) {
              const displayContent = attachmentChips ? `${attachmentChips}\n\n${text}` : text;
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "user",
                content: displayContent,
              });

              // Auto-title if still "New chat"
              if (thread.title === "New chat") {
                const title = (text || attachmentChips).slice(0, 60).replace(/\s+/g, " ").trim();
                await supabase
                  .from("chat_threads")
                  .update({ title: title || "New chat" })
                  .eq("id", threadId)
                  .eq("user_id", userId);
              } else {
                await supabase
                  .from("chat_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", threadId)
                  .eq("user_id", userId);
              }
            }
          }

          const gateway = createLovableAiGatewayProvider(LOVABLE_API_KEY);
          const model = gateway("google/gemini-3-flash-preview");

          const systemPrompt = attachmentContext
            ? `${GENERAL_SYSTEM}\n\nThe user has attached the following file(s). Use them as authoritative context for this turn. When they ask to summarize, explain, or generate a quiz, base your answer on the attachment content.\n\n${attachmentContext}`
            : GENERAL_SYSTEM;

          const result = streamText({
            model,
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
            onFinish: async ({ text }) => {
              if (text?.trim()) {
                await supabase.from("chat_messages").insert({
                  thread_id: threadId,
                  user_id: userId,
                  role: "assistant",
                  content: text,
                });
                await supabase
                  .from("chat_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", threadId)
                  .eq("user_id", userId);
              }
            },
          });

          return result.toUIMessageStreamResponse();
        } catch (err) {
          console.error("/api/chat error:", err);
          const msg = err instanceof Error ? err.message : "Internal error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
