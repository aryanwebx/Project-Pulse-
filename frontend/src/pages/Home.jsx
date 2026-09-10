import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const ArrowUpRight = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 17 17 7M8 7h9v9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 12 4 4L19 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f5f1] text-[#172033] selection:bg-[#d95f2b] selection:text-white">
      {/* Subtle paper/grid texture instead of the usual AI-style particle background. */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#172033 1px, transparent 1px), linear-gradient(90deg, #172033 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <header className="relative z-20 border-b border-[#172033]/10 bg-[#f6f5f1]/90 backdrop-blur-md">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/project-pulse-logo.svg"
              alt="Project Pulse community workspace"
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-[#172033]/60 sm:block">
                  Welcome, <span className="font-semibold text-[#172033]">{user?.name}</span>
                </span>
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25324a]">
                  Open dashboard <ArrowUpRight />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#172033]/70 transition hover:bg-[#172033]/5 hover:text-[#172033]">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25324a]">
                  Get started <ArrowUpRight />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#172033]/10 bg-white/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#172033]/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d95f2b]" />
                Community operations, simplified
              </div>

              <h1 className="max-w-4xl text-[clamp(3.4rem,7.2vw,6.9rem)] font-black leading-[0.91] tracking-[-0.065em] text-[#172033]">
                Turn local problems
                <br />
                into <span className="text-[#d95f2b]">visible progress.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#172033]/65 sm:text-xl">
                Project Pulse gives communities one clear place to report issues, understand what
                needs attention, and move work from complaint to resolution.
              </p>

              {!isAuthenticated && (
                <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-3 rounded-lg bg-[#d95f2b] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(217,95,43,.18)] transition hover:-translate-y-0.5 hover:bg-[#c95121]">
                    Start for free
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center rounded-lg border border-[#172033]/15 bg-white/50 px-6 py-3.5 text-sm font-bold text-[#172033] transition hover:bg-white">
                    Sign in
                  </Link>
                </div>
              )}

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#172033]/50">
                <span className="flex items-center gap-2">
                  <Check /> AI-assisted triage
                </span>
                <span className="flex items-center gap-2">
                  <Check /> Duplicate detection
                </span>
                <span className="flex items-center gap-2">
                  <Check /> Multi-community support
                </span>
              </div>
            </div>

            {/* Product preview: deliberately restrained, like a real SaaS product. */}
            <div className="relative">
              <div className="absolute -right-8 -top-8 hidden h-24 w-24 rounded-full border border-[#d95f2b]/20 lg:block" />
              <div className="overflow-hidden rounded-2xl border border-[#172033]/10 bg-white shadow-[0_24px_70px_rgba(23,32,51,.12)]">
                <div className="flex items-center justify-between border-b border-[#172033]/10 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#172033]/45">
                      Community overview
                    </p>
                    <p className="mt-1 text-sm font-bold">Northside Residents</p>
                  </div>
                  <span className="rounded-md bg-[#eaf4ec] px-2.5 py-1 text-[11px] font-bold text-[#28643a]">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-3 border-b border-[#172033]/10">
                  {[
                    ["24", "Open"],
                    ["18", "Resolved"],
                    ["6", "High priority"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="border-r border-[#172033]/10 px-4 py-5 last:border-r-0">
                      <p className="text-2xl font-black tracking-tight">{value}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#172033]/45">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 p-4">
                  {[
                    ["Street light out on 4th Ave", "High", "2h ago"],
                    ["Overflowing bin near park entrance", "Medium", "5h ago"],
                    ["Pothole by community center", "Low", "Yesterday"],
                  ].map(([title, priority, time], index) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-[#172033]/8 bg-[#fafaf8] p-3.5">
                      <span
                        className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#d95f2b]" : index === 1 ? "bg-[#d8a22b]" : "bg-[#6b7b91]"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">{title}</p>
                        <p className="mt-1 text-[10px] text-[#172033]/40">{time}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#172033]/45">{priority}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#172033]/10 bg-[#172033] px-5 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/65">AI triage</span>
                    <span className="text-xs font-bold text-[#f3a27d]">3 suggestions ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-y border-[#172033]/10 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d95f2b]">
                  Built for the workflow
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                  Less noise. Better decisions. Faster follow-through.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#172033]/55">
                The product stays focused on the work: capture an issue, understand it, assign it,
                and show people what changed.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-[#172033]/10 bg-[#172033]/10 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Smart issue tracking",
                  body: "Capture reports with consistent categories, priorities, ownership, and status so nothing gets lost.",
                },
                {
                  number: "02",
                  title: "Useful AI insights",
                  body: "Surface duplicate reports and suggestions that help admins spend less time sorting and more time acting.",
                },
                {
                  number: "03",
                  title: "Multiple communities",
                  body: "Keep communities separate while giving admins a consistent operating model across every space.",
                },
              ].map((feature) => (
                <article key={feature.number} className="group bg-white p-7 sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-[#d95f2b]">
                      {feature.number}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#172033]/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#d95f2b]" />
                  </div>
                  <h3 className="mt-12 text-xl font-black tracking-[-0.025em]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#172033]/55">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Proof / stats */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d95f2b]">
                The outcome
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                A clearer view of what your community needs.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#172033]/60">
                Replace scattered reports and manual sorting with a shared source of truth for
                community issues.
              </p>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-[#172033]/10 bg-white sm:grid-cols-3">
              {[
                ["99%", "Issues resolved", "Tracked from report to closure"],
                ["50%", "Faster resolution", "Less time spent on triage"],
                ["24/7", "AI monitoring", "Continuous issue intelligence"],
              ].map(([value, title, body], index) => (
                <div
                  key={title}
                  className={`p-7 sm:p-8 ${index !== 0 ? "border-t sm:border-l sm:border-t-0 border-[#172033]/10" : ""}`}>
                  <p className="text-4xl font-black tracking-[-0.05em] text-[#172033]">{value}</p>
                  <p className="mt-4 text-sm font-bold">{title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-[#172033]/45">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
            <div className="overflow-hidden rounded-2xl bg-[#172033] px-7 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f3a27d]">
                  Ready when you are
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                  Make every issue easier to act on.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                  Set up your community workspace and start turning reports into organized,
                  measurable progress.
                </p>
              </div>
              <Link
                to="/register"
                className="mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#d95f2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c95121] lg:mt-0">
                Create your workspace <ArrowUpRight />
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 border-t border-[#172033]/10 bg-[#eeece6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img
              src="/project-pulse-logo.svg"
              alt="Project Pulse community workspace"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-xs text-[#172033]/45">
            Building better communities with thoughtful technology.
          </p>
          <p className="text-xs text-[#172033]/40">© 2024 Project Pulse</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
