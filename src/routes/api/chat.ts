import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

const GENERAL_SYSTEM = `You are ExamPass AI's general assistant — a friendly, intelligent, and helpful AI for Namibian students and beyond.

Personality:
- Warm but precise. Clear, concise, never robotic.
- You can answer ANY question: study help, life advice, coding, creative writing, general knowledge.
- Use markdown for structure (headings, lists, code blocks) when it improves clarity.
- If the user asks about NSSCO study topics specifically, give a strong answer but remind them they can switch to Study Mode for focused subject practice.
- Never refuse reasonable questions. Never lecture. Never be condescending.`;

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
              await supabase.from("chat_messages").insert({
                thread_id: threadId,
                user_id: userId,
                role: "user",
                content: text,
              });

              // Auto-title if still "New chat"
              if (thread.title === "New chat") {
                const title = text.slice(0, 60).replace(/\s+/g, " ").trim();
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

          const result = streamText({
            model,
            system: GENERAL_SYSTEM,
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
