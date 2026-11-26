import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/common/StatusAndPriority'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Repeat,
  Sparkles,
  TrendingDown,
  Users,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const CyclesPage: React.FC = () => {
  const { cycles, projects, tasks, updateCycle } = useAppStore()
  const [expandedCycleId, setExpandedCycleId] = useState<string>(cycles[0]?.id || '')

  const activeCycles = cycles.filter(c => c.status === 'Active')
  const upcomingCycles = cycles.filter(c => c.status === 'Upcoming')
  const completedCycles = cycles.filter(c => c.status === 'Completed')

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span>WORKSPACE</span>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">SPRINT CYCLES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading flex items-center gap-3">
            <span>Sprint Cycles & Telemetry</span>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/10 text-[#0284C7] border border-sky-500/20">
              {activeCycles.length} Active Sprints
            </span>
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => toast.info('New sprint cycle creation dialog ready')}
          className="h-9 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white shadow-md shadow-sky-500/25"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Create Sprint Cycle
        </Button>
      </div>

      {/* Section 1: Active Cycles with Burndown */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          ACTIVE SPRINT CYCLES ({activeCycles.length})
        </h2>

        {activeCycles.map((cycle) => {
          const project = projects.find(p => p.id === cycle.projectId)
          const isExpanded = expandedCycleId === cycle.id
          const percent = Math.round((cycle.completedTasks / (cycle.totalTasks || 1)) * 100)

          return (
            <div
              key={cycle.id}
              className="rounded-2xl border border-sky-500/30 bg-surface shadow-xs overflow-hidden transition-all duration-200"
            >
              {/* Summary Bar */}
              <div
                onClick={() => setExpandedCycleId(isExpanded ? '' : cycle.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors bg-gradient-to-r from-sky-500/5 to-transparent"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-sky-500/20">
                    <Repeat className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-heading font-extrabold text-base text-foreground">{cycle.name}</h3>
                      <StatusBadge status={cycle.status} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block font-medium">
                      {project?.name} <span className="font-mono font-bold text-foreground">[{project?.identifier}]</span> • {cycle.startDate} to {cycle.endDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-foreground">
                        {cycle.completedTasks} / {cycle.totalTasks}
                      </span>
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Completed ({percent}%)
                      </span>
                    </div>
                    <div className="w-24 bg-secondary h-2.5 rounded-full overflow-hidden shadow-2xs">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <button className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Burndown Chart Arena */}
              {isExpanded && cycle.burndownHistory && (
                <div className="p-6 border-t border-border/80 bg-muted/15 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-500" />
                        <span>Sprint Burndown Telemetry</span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tracking daily remaining scope versus ideal theoretical linear trajectory
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Ideal Linear Burn
                      </span>
                      <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> Actual Remaining Work
                      </span>
                    </div>
                  </div>

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cycle.burndownHistory}>
                        <defs>
                          <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.7} />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="actualRemaining"
                          name="Actual Remaining"
                          stroke="#0284C7"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#burndownGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="idealRemaining"
                          name="Ideal Linear"
                          stroke="#94A3B8"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          fillOpacity={0}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Section 2: Upcoming Cycles Cards */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          UPCOMING PIPELINE CYCLES ({upcomingCycles.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingCycles.map((cycle) => {
            const project = projects.find(p => p.id === cycle.projectId)
            return (
              <div
                key={cycle.id}
                className="p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent bg-surface shadow-xs space-y-3 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-sm text-foreground">{cycle.name}</h3>
                  <StatusBadge status="Upcoming" />
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Associated Track: <strong className="text-foreground">{project?.name}</strong> [{project?.identifier}]
                </div>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-border/80">
                  <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                    {cycle.startDate} → {cycle.endDate}
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                    {cycle.totalTasks} Scope Items
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
