import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold" style={{ color: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>404</h1>
        <h2 className="mt-4 text-xl font-semibold" style={{ color: "var(--color-foreground)" }}>Page not found</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-foreground)" }}>
          This page didn't load
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ExamPass AI — Ace Your NSSCO Exams" },
      { name: "description", content: "AI-powered exam preparation for Namibian NSSCO students. Generate quizzes, get explanations, and track your progress." },
      { name: "author", content: "ExamPass AI" },
      { property: "og:title", content: "ExamPass AI — Ace Your NSSCO Exams" },
      { property: "og:description", content: "AI-powered exam preparation for Namibian NSSCO students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppNav({ user }: { user: { email?: string } | null }) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/", replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: "var(--color-border)", backgroundColor: "oklch(0.12 0.015 260 / 0.8)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>ExamPass AI</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-foreground)" }}>
                Dashboard
              </Link>
              <Link to="/progress" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-foreground)" }}>
                Progress
              </Link>
              <Link to="/rank" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-foreground)" }}>
                Rank
              </Link>
              <Link to="/pdf" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--color-foreground)" }}>
                PDF
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--color-surface)", color: "var(--color-foreground)" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email || undefined } : null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setUser(session?.user ? { email: session.user.email || undefined } : null);
        queryClient.invalidateQueries();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>
        <AppNav user={user} />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t py-6 text-center text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
          <p>© 2025 ExamPass AI. Made for Namibian NSSCO students.</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
