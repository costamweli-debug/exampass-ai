import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brain, Trophy, MessageSquare, FileText, Zap, BarChart3, Users } from "lucide-react";
import heroImg from "@/assets/hero.png";
import { SUBJECTS } from "@/lib/subjects";

const FEATURES = [
  { icon: Brain, title: "AI-Generated Quizzes", desc: "Get exam-style multiple choice questions tailored to your subject and topic." },
  { icon: MessageSquare, title: "Smart Tutor Chat", desc: "Ask questions within your subject. No general chat — only focused learning." },
  { icon: Trophy, title: "Rank System", desc: "Climb from Beginner to Elite based on your quiz performance." },
  { icon: BarChart3, title: "Progress Tracking", desc: "See your scores, averages, and improvement over time per subject." },
  { icon: FileText, title: "PDF Exam Papers", desc: "Upload past papers. AI summarizes them and generates quizzes from the content." },
  { icon: Zap, title: "Instant Explanations", desc: "Get clear explanations for every answer so you learn while you quiz." },
];

const TOTAL_TOPICS = SUBJECTS.reduce((sum, s) => sum + s.topics.length, 0);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExamPass AI — Ace Your NSSCO Exams" },
      { name: "description", content: "AI-powered exam preparation for Namibian NSSCO students. Generate quizzes, get explanations, and track your progress." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: "oklch(0.72 0.18 165 / 0.15)", color: "var(--color-mint)" }}>
              <Zap className="h-4 w-4" /> AI-Powered NSSCO Prep
            </div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Study Smarter.
              <br />
              <span style={{ color: "var(--color-mint)" }}>Pass Every Exam.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed lg:mx-0" style={{ color: "var(--color-muted-foreground)" }}>
              AI-generated quizzes, instant explanations, and smart progress tracking — all tailored for Namibian NSSCO students.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                Start Learning Free <Zap className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-base font-medium transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                <BookOpen className="h-4 w-4" /> Explore Subjects
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--color-mint)", fontFamily: "var(--font-display)" }}>{SUBJECTS.length}</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Subjects</p>
              </div>
              <div className="h-8 w-px" style={{ backgroundColor: "var(--color-border)" }} />
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--color-mint)", fontFamily: "var(--font-display)" }}>{TOTAL_TOPICS}+</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Topics</p>
              </div>
              <div className="h-8 w-px" style={{ backgroundColor: "var(--color-border)" }} />
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--color-mint)", fontFamily: "var(--font-display)" }}>AI</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Powered</p>
              </div>
            </div>
          </div>
          <div className="relative flex-1">
            <div className="absolute -inset-4 rounded-3xl opacity-30 blur-3xl" style={{ background: "linear-gradient(135deg, var(--color-mint), oklch(0.55 0.16 165))" }} />
            <img
              src={heroImg}
              alt="Students studying with AI"
              className="relative rounded-2xl"
              width={512}
              height={512}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-4 py-16" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
            All Your NSSCO Subjects
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center" style={{ color: "var(--color-muted-foreground)" }}>
            Choose from 7 core subjects, each with 8+ focused topics.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.name}
                className="flex flex-col items-center gap-3 rounded-2xl border p-6 transition-transform hover:scale-105"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <span className="text-4xl">{subject.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
            Everything You Need to Pass
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center" style={{ color: "var(--color-muted-foreground)" }}>
            A complete toolkit built for exam success.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 transition-all hover:-translate-y-1"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <div className="mb-4 inline-flex rounded-xl p-3" style={{ backgroundColor: "oklch(0.72 0.18 165 / 0.1)" }}>
                  <feature.icon className="h-6 w-6" style={{ color: "var(--color-mint)" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl p-10 text-center" style={{ background: "linear-gradient(135deg, oklch(0.18 0.04 260), oklch(0.22 0.06 260))" }}>
          <Users className="mx-auto h-12 w-12" style={{ color: "var(--color-mint)" }} />
          <h2 className="mt-6 text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
            Ready to Ace Your Exams?
          </h2>
          <p className="mx-auto mt-4 max-w-md" style={{ color: "var(--color-muted-foreground)" }}>
            Join thousands of Namibian students using AI to study smarter and pass their NSSCO exams.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            <Zap className="h-4 w-4" /> Start Learning Now
          </Link>
        </div>
      </section>
    </div>
  );
}
