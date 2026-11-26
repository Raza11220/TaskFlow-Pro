import React, { useState } from 'react'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  BarChart3,
  Eye,
  EyeOff,
  FolderKanban,
  MessageSquare,
  Repeat,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Login Page ────────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      toast.success('Signed in successfully!')
      navigate('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background select-none md:grid md:grid-cols-2">
      <section className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 py-6 sm:px-10 sm:py-8 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <Logo hideText size="lg" />
        </div>

        <div className="relative z-10 mx-auto my-auto w-full max-w-md py-10">
          <div className="space-y-6 rounded-3xl border border-border/70 bg-surface/90 p-6 shadow-xl shadow-slate-950/5 backdrop-blur sm:p-8">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#086F83] dark:text-[#55B6C7]">
                Your team workspace
              </span>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Welcome back
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Sign in to manage projects, review sprint cycles, and coordinate with your team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Work email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl bg-background/70 px-4 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#086F83] transition-colors hover:text-[#075B6C] hover:underline dark:text-[#55B6C7]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-background/70 px-4 pr-11 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#086F83] text-sm font-semibold text-white shadow-sm shadow-[#086F83]/20 transition-all hover:-translate-y-0.5 hover:bg-[#075B6C] hover:shadow-md"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don’t have an account?{' '}
              <Link to="/signup" className="font-semibold text-[#086F83] transition-colors hover:underline dark:text-[#55B6C7]">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="relative z-10 mx-auto w-full max-w-md text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TaskFlow Pro. All rights reserved.
        </p>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#073B4C] via-[#086F83] to-[#044F5E] p-10 text-white md:flex lg:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -left-28 h-[30rem] w-[30rem] rounded-full bg-cyan-300/10 blur-3xl"
        />
        <div className="relative z-10 m-auto w-full max-w-xl space-y-10">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Built for teams that build
            </span>
            <h2 className="font-heading text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Bring your team’s work into focus.
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-white/75">
              Plan projects, coordinate delivery, and keep every conversation connected to the work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: FolderKanban, title: 'Projects & tasks', desc: 'Keep ownership and priorities clear.' },
              { icon: Repeat, title: 'Sprint workflows', desc: 'Plan cycles and track team progress.' },
              { icon: MessageSquare, title: 'Team collaboration', desc: 'Share updates in real time.' },
              { icon: BarChart3, title: 'Actionable insights', desc: 'Understand delivery at a glance.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/65">{desc}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/65">
            <ShieldCheck className="h-4 w-4 text-cyan-100" />
            Organization workspaces with role-based access.
          </div>
        </div>
      </aside>
    </div>
  )
}

// ─── Signup Page ───────────────────────────────────────────────────────────────
export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { authService } = await import('@/services/auth.service')
      const res = await authService.register(form)
      if (res.success) {
        toast.success('Account created! Signing you in…')
        const success = await login(form.email, form.password)
        if (success) {
          navigate('/onboarding')
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <Logo className="justify-center mb-2" />
          <h1 className="text-xl font-bold font-heading text-foreground">Create your account</h1>
          <p className="text-xs text-muted-foreground">Start your free workspace today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Ali"
                className="h-8 text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                placeholder="Khan"
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Work Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@company.com"
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 chars with uppercase & number"
                className="h-8 text-xs pr-8"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#086F83] hover:bg-[#075B6C] text-white h-8 text-xs font-semibold"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-[#086F83] dark:text-[#55B6C7] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Forgot Password Page ──────────────────────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { authService } = await import('@/services/auth.service')
      await authService.forgotPassword(email)
      setSubmitted(true)
      toast.success('Recovery email sent if account exists')
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true)
      toast.success('Recovery email sent if account exists')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6 text-xs">
        <div className="text-center space-y-1">
          <Logo className="justify-center mb-2" />
          <h1 className="text-xl font-bold font-heading text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a recovery link.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-md bg-[#EAF5F7] dark:bg-[#173239] text-xs text-[#086F83] dark:text-[#55B6C7] space-y-2">
            <strong>Check your email!</strong>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              If an account exists for {email}, a password reset link has been sent.
            </p>
            <Link to="/login" className="font-bold underline block pt-2">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs">Your Registered Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-8 text-xs"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#086F83] text-white h-8 text-xs"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send Recovery Link'}
            </Button>
          </form>
        )}

        <div className="text-center text-muted-foreground">
          <Link to="/login" className="text-[#086F83] font-semibold hover:underline">← Back to Log In</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding Page ───────────────────────────────────────────────────────────
export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { setOrganization } = useAuth()
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (step < 3) {
      if (step === 1 && !orgName.trim()) {
        toast.error('Organization name is required')
        return
      }
      setStep(step + 1)
      return
    }
    setLoading(true)
    try {
      const { organizationService } = await import('@/services/organization.service')
      const res = await organizationService.createOrganization({
        name: orgName.trim(),
        ...(industry.trim() ? { industry: industry.trim() } : {}),
        ...(teamSize ? { teamSize } : {}),
      })
      const createdOrganization = res?.data?.organization
      const organizationId = createdOrganization?.id || createdOrganization?._id
      if (createdOrganization && organizationId) {
        setOrganization({
          id: organizationId,
          name: createdOrganization.name || '',
          slug: createdOrganization.slug || '',
          logo: createdOrganization.logo,
        })
        toast.success('Workspace created and ready!')
        navigate('/app/dashboard')
      } else {
        toast.error('Workspace was created, but its details could not be loaded. Please refresh and try again.')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create organization'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg p-8 rounded-lg border border-border bg-surface shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Logo />
          <span className="font-mono text-xs text-muted-foreground font-semibold">Step {step} of 3</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Name your organization</h2>
            <div className="space-y-1">
              <Label className="text-xs">Organization / Company Name</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name" className="h-8 text-xs" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Team Size & Industry</h2>
            <div className="space-y-1">
              <Label className="text-xs">Industry (optional)</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Team size (optional)</Label>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full h-8 text-xs rounded border border-border bg-background px-2"
              >
                <option value="">Select team size</option>
                <option value="1-10">1-10 members</option>
                <option value="11-50">11-50 members</option>
                <option value="51-200">51-200 members</option>
                <option value="200+">200+ enterprise</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">Ready to launch!</h2>
            <div className="p-4 rounded-lg bg-[#EAF5F7] dark:bg-[#173239] space-y-1 text-[#086F83] dark:text-[#55B6C7]">
              <div><strong>Organization:</strong> {orgName}</div>
              {industry && <div><strong>Industry:</strong> {industry}</div>}
              {teamSize && <div><strong>Team Size:</strong> {teamSize}</div>}
            </div>
            <p className="text-muted-foreground text-[11px]">
              Click "Launch Workspace" to create your organization and get started.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
          ) : <div />}
          <Button size="sm" onClick={handleNext} disabled={loading} className="bg-[#086F83] text-white">
            {loading ? 'Creating…' : step === 3 ? 'Launch Workspace →' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
