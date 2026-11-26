import React from 'react'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FolderKanban,
  Layers,
  Repeat,
  Shield,
  Sparkles,
  Users,
  Zap
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground select-none selection:bg-sky-500/20 selection:text-sky-600">
      {/* Editorial Navigation */}
      <header className="fixed left-1/2 top-3 z-50 flex h-14 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-full border border-border/70 bg-surface/85 px-3 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 sm:top-4 sm:h-16 sm:w-[calc(100%-2rem)] sm:px-6 lg:px-8">
        <Logo
          hideText
          size="lg"
          className="shrink-0 max-[400px]:[&_img]:h-8 max-[400px]:[&_img]:max-w-[130px]"
        />

        <nav className="hidden items-center gap-1 text-xs font-semibold text-muted-foreground md:flex">
          <a href="#features" className="rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/10 hover:text-[#0284C7] dark:hover:text-[#38BDF8]">Features</a>
          <a href="#workflow" className="rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/10 hover:text-[#0284C7] dark:hover:text-[#38BDF8]">Workflow</a>
          <a href="#pricing" className="rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/10 hover:text-[#0284C7] dark:hover:text-[#38BDF8]">Pricing</a>
          <a href="#faq" className="rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/10 hover:text-[#0284C7] dark:hover:text-[#38BDF8]">FAQ</a>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="rounded-full px-3 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/10 hover:text-[#0284C7] sm:px-4"
          >
            Sign in
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/login')}
            className="rounded-full bg-[#0284C7] px-3 text-xs font-semibold text-white shadow-sm shadow-[#0284C7]/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0369A1] hover:shadow-md hover:shadow-[#0284C7]/30 sm:px-4"
          >
            Sign in
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section with High-Impact Typography */}
      <section className="pt-40 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-[#0284C7] dark:text-[#38BDF8] text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TASKFLOW PRO — PROJECT WORKSPACE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-[1.08] text-foreground">
          Less managing. <br />
          <span className="bg-gradient-to-r from-[#0284C7] to-indigo-600 dark:from-[#38BDF8] dark:to-indigo-400 bg-clip-text text-transparent">
            More meaningful work.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Plan projects, organize complex sprints, and convert everyday team collaboration into crystal-clear progress with unprecedented software craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="h-12 px-7 text-sm rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold shadow-md shadow-[#0284C7]/25 w-full sm:w-auto"
          >
            Sign in to your workspace
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="scroll-mt-24 py-24 border-t border-border bg-surface px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Precision crafted for engineering rigor
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Eliminate administrative clutter. Every workflow is optimized for instant clarity and responsiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/80 bg-canvas space-y-3.5 hover:border-[#0284C7]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center">
                <FolderKanban className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Interactive Kanban Machine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accessible drag-and-drop status transitions with dnd-kit, reflected in workspace activity and calendar deadlines.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-canvas space-y-3.5 hover:border-[#0284C7]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Repeat className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Mathematical Burndowns</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compare actual remaining items against linear ideal burndown trajectories using responsive Recharts telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-canvas space-y-3.5 hover:border-[#0284C7]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Client-Side Export Engine</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                One-click instant client CSV formatting (PapaParse) and white-label executive PDF creation (jsPDF AutoTable).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-24 border-t border-border bg-background px-6 py-24">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7] dark:text-[#38BDF8]">
              A clearer way to work
            </span>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              From kickoff to shipped, all in one flow.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Give your team one shared place to plan work, stay aligned, and see progress.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Bring everyone together',
                description: 'Create a shared organization and give every teammate a clear place to collaborate.',
              },
              {
                step: '02',
                icon: Layers,
                title: 'Turn plans into action',
                description: 'Organize projects, break work into tasks, and keep priorities visible on your board.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Keep momentum visible',
                description: 'Follow sprint progress, share updates, and use team insights to plan what comes next.',
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <article
                key={step}
                className="group rounded-2xl border border-border/80 bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-950/5"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-[#0284C7] transition-colors group-hover:bg-[#0284C7] group-hover:text-white dark:text-[#38BDF8] dark:group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground/60">
                    {step}
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl space-y-14">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7] dark:text-[#38BDF8]">
              Flexible plans
            </span>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              The right setup for your team.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tell us what your team needs and we’ll help find the right fit. Pricing is tailored; no made-up rates.
            </p>
          </div>

          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {[
              {
                name: 'Starter',
                description: 'For small teams getting their work organized.',
                features: ['Shared projects and task boards', 'Team workspace and activity', 'Priorities and due dates'],
              },
              {
                name: 'Team',
                description: 'For teams coordinating active projects and sprints.',
                features: ['Everything in Starter', 'Sprint cycles and burndown', 'Team chat and analytics'],
                featured: true,
              },
              {
                name: 'Enterprise',
                description: 'For organizations that need structured access and oversight.',
                features: ['Multiple teams and workspaces', 'Role-based access controls', 'Organization-wide reporting'],
              },
            ].map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  plan.featured
                    ? 'border-[#0284C7]/50 bg-background ring-1 ring-[#0284C7]/20 shadow-sky-950/5'
                    : 'border-border/80 bg-background hover:border-sky-500/40'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#0284C7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                  <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <p className="mb-6 text-sm font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                  Contact for pricing
                </p>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
                    plan.featured
                      ? 'bg-[#0284C7] text-white shadow-sm hover:bg-[#0369A1]'
                      : 'border border-border bg-surface hover:border-sky-500/40 hover:bg-sky-500/5'
                  }`}
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-border bg-background px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7] dark:text-[#38BDF8]">
              FAQ
            </span>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Questions, answered.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Need a workspace?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#0284C7] underline underline-offset-4 hover:text-[#0369A1] dark:text-[#38BDF8]"
              >
                Create an account.
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                question: 'What can I manage with TaskFlow Pro?',
                answer: 'Plan projects, organize tasks on Kanban boards, coordinate sprint cycles, and keep team conversations and progress in one workspace.',
              },
              {
                question: 'Does TaskFlow Pro support team collaboration?',
                answer: 'Yes. Workspaces include team roles, shared project activity, notifications, and real-time chat features.',
              },
              {
                question: 'How much does TaskFlow Pro cost?',
                answer: 'Pricing is tailored to team size and requirements. No fixed rates are published here.',
              },
              {
                question: 'Can I explore the product before choosing a plan?',
                answer: 'Contact your workspace administrator to request an account, then sign in to access your team workspace.',
              },
            ].map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-2xl border border-border/80 bg-surface px-5 py-4 transition-colors open:border-sky-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <span className="text-xl font-normal text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-br from-slate-950 via-sky-950 to-[#082f49] px-6 py-14 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.16),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-3">
              <Logo hideText size="md" className="brightness-0 invert" />
              <p className="max-w-md text-sm leading-relaxed text-slate-300">
                Make work flow. Plan projects, coordinate teams, and keep every sprint moving.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-sky-200"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Tara Technologies. All rights reserved.</span>
            <span>Made for modern engineering teams.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
