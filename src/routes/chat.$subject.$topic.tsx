import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSubjectById, getTopicById } from "@/lib/subjects";
import { chatWithSubject } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";

type Message = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/chat/$subject/$topic")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Unauthorized");
    return { user: data.user };
  },
  head: ({ params }) => ({
    meta: [{ title: `Chat — ${params.subject} | ExamPass AI` }],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { subject: subjectId, topic: topicId } = Route.useParams();
  const subject = getSubjectById(subjectId);
  const topic = getTopicById(subjectId, topicId);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hi! I'm your AI tutor for ${subject?.name} — ${topic?.name}. Ask me anything about this topic and I'll help you understand it.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatFn = useServerFn(chatWithSubject);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!subject || !topic) return <div className="px-4 py-12 text-center">Invalid subject/topic.</div>;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await chatFn({
        data: {
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          subject: subject.name,
          topic: topic.name,
        },
      });
      setMessages([...newMessages, { role: "assistant", content: res.response }]);
    } catch (e) {
      console.error(e);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't respond. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col">
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/topics/$subject" params={{ subject: subjectId }} className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-muted-foreground)" }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="text-center">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
              <Sparkles className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> AI Tutor
            </div>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{subject.name} • {topic.name}</p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  backgroundColor: msg.role === "user" ? "var(--color-primary)" : "var(--color-card)",
                  color: msg.role === "user" ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                  border: msg.role === "assistant" ? `1px solid var(--color-border)` : "none",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border px-4 py-3" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--color-mint)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask about ${topic.name}...`}
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-foreground)] outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center rounded-xl px-4 transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
