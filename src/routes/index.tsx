import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  MessageSquare,
  Trophy,
  BarChart3,
  FileText,
  Zap,
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  Star,
  Upload,
  GraduationCap,
} from "lucide-react";
import heroImg from "@/assets/hero.png";
import { SUBJECTS } from "@/lib/subjects";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Quizzes That Actually Teach",
    desc: "Exam-style questions generated for your exact topic. No two quizzes are the same.",
  },
  {
    icon: MessageSquare,
    title: "Your Personal Tutor, 24/7",
    desc: "Ask anything about your subject. Get answers that make the concept click.",
  },
  {
    icon: BarChart3,
    title: "Know Exactly Where You Stand",
    desc: "See your weak topics, track improvement, and study only what moves your grade.",
  },
  {
    icon: Trophy,
    title: "Climb from Beginner to Elite",
    desc: "Earn XP, level up, and turn revision into a habit you actually enjoy.",
  },
  {
    icon: FileText,
    title: "Turn Past Papers Into Practice",
    desc: "Upload any PDF. Get instant summaries and 10 fresh questions from it.",
  },
  {
    icon: Zap,
    title: "Instant, Clear Explanations",
    desc: "Every answer comes with the why — so you learn, not just memorize.",
  },
];

const STEPS = [
  { icon: Target, title: "Pick your subject", desc: "Choose from all NSSCO & AS Level subjects." },
  { icon: Sparkles, title: "Practice with AI", desc: "Take quizzes, ask questions, upload notes." },
  { icon: Trophy, title: "Watch your grade rise", desc: "Track progress and level up daily." },
];

const TOTAL_TOPICS = SUBJECTS.reduce((sum, s) => sum + s.topics.length, 0);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExamPass AI — Pass NSSCO & AS Level with AI" },
      {
        name: "description",
        content:
          "AI-powered exam prep for Namibian students. Generate quizzes, get instant explanations, and track progress for NSSCO & AS Level. Study smarter, pass with confidence.",
      },
      { property: "og:title", content: "ExamPass AI — Pass NSSCO & AS Level with AI" },
      {
        property: "og:description",
        content: "Study smarter. Pass with confidence. AI-powered NSSCO & AS Level prep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ backgroundColor: "oklch(0.72 0.18 165 / 0.15)", color: "var(--color-mint)" }}
            >
              <Sparkles className="h-4 w-4" /> Built for NSSCO & AS Level
            </div>
            <h1
              className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}
            >
              Pass Your Exams.
              <br />
              <span style={{ color: "var(--color-mint)" }}>Powered by AI.</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-lg text-lg leading-relaxed lg:mx-0"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              The smartest way for Namibian students to prep for NSSCO and AS Level. AI quizzes, instant explanations, real progress.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                Start Practicing Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-base font-medium transition-colors"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm lg:justify-start" style={{ color: "var(--color-muted-foreground)" }}>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> Free to start</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> Works on mobile</span>
            </div>
          </div>
          <div className="relative flex-1">
            <div
              className="absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
              style={{ background: "linear-gradient(135deg, var(--color-mint), oklch(0.55 0.16 165))" }}
            />
            <img
              src={heroImg}
              alt="Namibian students studying with ExamPass AI"
              className="relative rounded-2xl"
              width={512}
              height={512}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y px-4 py-8" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" style={{ color: "var(--color-mint)" }} />
              ))}
            </div>
            <span>Loved by students across Namibia</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>
            <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> NSSCO Aligned</span>
            <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> AS Level Ready</span>
            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: "var(--color-mint)" }} /> Powered by AI</span>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mint)" }}>Subjects</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Every subject. Every topic.
            </h2>
            <p className="mt-4" style={{ color: "var(--color-muted-foreground)" }}>
              {SUBJECTS.length} core subjects. {TOTAL_TOPICS}+ focused topics. One place to master them all.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.id}
                className="flex flex-col items-center gap-3 rounded-2xl border p-6 transition-transform hover:scale-105"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <span className="text-4xl">{subject.emoji}</span>
                <span className="text-center text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mint)" }}>Features</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Everything you need to pass.
            </h2>
            <p className="mt-4" style={{ color: "var(--color-muted-foreground)" }}>
              Built with one goal: better grades, less stress.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border p-6 transition-all hover:-translate-y-1"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <div className="mb-4 inline-flex rounded-xl p-3" style={{ backgroundColor: "oklch(0.72 0.18 165 / 0.1)" }}>
                  <feature.icon className="h-6 w-6" style={{ color: "var(--color-mint)" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mint)" }}>How it works</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Start passing in 3 steps.
            </h2>
            <p className="mt-4" style={{ color: "var(--color-muted-foreground)" }}>
              No setup. No overwhelm. Just study.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl border p-8"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
              >
                <div
                  className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: "var(--color-mint)", color: "var(--color-primary-foreground)" }}
                >
                  {idx + 1}
                </div>
                <step.icon className="h-8 w-8" style={{ color: "var(--color-mint)" }} />
                <h3 className="mt-4 text-lg font-semibold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF highlight */}
      <section className="px-4 py-16" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-3xl border p-8 sm:p-12 md:grid-cols-2" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}>
          <div>
            <div className="inline-flex rounded-xl p-3" style={{ backgroundColor: "oklch(0.72 0.18 165 / 0.15)" }}>
              <Upload className="h-6 w-6" style={{ color: "var(--color-mint)" }} />
            </div>
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Drop a past paper. Get a quiz.
            </h3>
            <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
              Upload any PDF — notes, textbook chapter, past exam. Our AI reads it and builds a fresh practice quiz in seconds.
            </p>
          </div>
          <ul className="space-y-3">
            {["Instant AI summary of any PDF", "10 exam-style questions per upload", "Perfect for last-minute revision"].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-foreground)" }}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-mint)" }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24">
        <div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-10 text-center sm:p-14"
          style={{ background: "linear-gradient(135deg, oklch(0.18 0.04 260), oklch(0.22 0.06 260))" }}
        >
          <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: "var(--color-mint)" }} />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-display)", color: "var(--color-foreground)" }}>
              Your best grade starts today.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg" style={{ color: "var(--color-muted-foreground)" }}>
              Join Namibian students turning study time into exam wins.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
            >
              Start Practicing Free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              Free forever plan · No credit card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
