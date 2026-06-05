import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MessageSquare, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSubjectById } from "@/lib/subjects";

export const Route = createFileRoute("/topics/$subject")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Unauthorized");
    return { user: data.user };
  },
  head: ({ params }) => {
    const subject = getSubjectById(params.subject);
    return {
      meta: [
        { title: `${subject?.name ?? "Topics"} — ExamPass AI` },
        { name: "description", content: `Select a topic to start your AI-powered ${subject?.name ?? ""} quiz.` },
      ],
    };
  },
  component: TopicsPage,
});

function TopicsPage() {
  const { subject: subjectId } = Route.useParams();
  const navigate = useNavigate();
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return (
      <div className="px-4 py-12 text-center">
        <p>Subject not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block underline" style={{ color: "var(--color-mint)" }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to subjects
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ backgroundColor: `${subject.color}20` }}>
            {subject.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              {subject.name}
            </h1>
            <p className="mt-1" style={{ color: "var(--color-muted-foreground)" }}>{subject.description}</p>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
          Choose a Topic
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {subject.topics.map((topic) => (
            <div
              key={topic.id}
              className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
            >
              <span className="font-medium" style={{ color: "var(--color-foreground)" }}>{topic.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: "/chat/$subject/$topic", params: { subject: subject.id, topic: topic.id } })}
                  className="rounded-lg p-2 transition-colors hover:opacity-80"
                  style={{ backgroundColor: "var(--color-surface-raised)" }}
                  title="Chat with AI"
                >
                  <MessageSquare className="h-4 w-4" style={{ color: "var(--color-mint)" }} />
                </button>
                <button
                  onClick={() => navigate({ to: "/quiz/$subject/$topic", params: { subject: subject.id, topic: topic.id } })}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: subject.color, color: "var(--color-background)" }}
                >
                  <Zap className="h-4 w-4" /> Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
