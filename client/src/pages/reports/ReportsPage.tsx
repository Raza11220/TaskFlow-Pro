import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { toast } from 'sonner'

export const ReportsPage: React.FC = () => {
  const { tasks, projects, members, organization } = useAppStore()
  const [selectedProjectId, setSelectedProjectId] = useState('all')

  const filteredTasks = tasks.filter(t => {
    if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false
    return true
  })

  // Priority distribution data with vibrant colors
  const priorityData = [
    { name: 'Urgent', count: filteredTasks.filter(t => t.priority === 'Urgent').length, color: '#EF4444' },
    { name: 'High', count: filteredTasks.filter(t => t.priority === 'High').length, color: '#F59E0B' },
    { name: 'Medium', count: filteredTasks.filter(t => t.priority === 'Medium').length, color: '#0EA5E9' },
    { name: 'Low', count: filteredTasks.filter(t => t.priority === 'Low').length, color: '#64748B' }
  ]

  // Team Workload aggregation
  const workloadByMember = members.slice(0, 8).map(m => ({
    name: m.name.split(' ')[0],
    assigned: tasks.filter(t => t.assigneeIds.includes(m.id)).length,
    completed: tasks.filter(t => t.assigneeIds.includes(m.id) && t.status === 'Done').length
  }))

  const handleExportCSV = () => {
    const csvData = filteredTasks.map(t => {
      const prj = projects.find(p => p.id === t.projectId)
      return {
        Key: t.identifier,
        Title: t.title,
        Project: prj?.name || '',
        Status: t.status,
        Priority: t.priority,
        DueDate: t.dueDate,
        Labels: t.labels.join(', ')
      }
    })

    if (csvData.length === 0) {
      toast.info('No tasks match the selected project.')
      return
    }

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `TaskFlow-Report-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported report to CSV')
  }

  const handleExportPDF = () => {
    if (filteredTasks.length === 0) {
      toast.info('No tasks match the selected project.')
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('TaskFlow Pro — Executive Operational Report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Organization: ${organization.name} | Generated: ${new Date().toLocaleDateString()}`, 14, 26)

    const tableData = filteredTasks.slice(0, 30).map(t => {
      const prj = projects.find(p => p.id === t.projectId)
      return [t.identifier, t.title.slice(0, 35), prj?.identifier || '', t.status, t.priority, t.dueDate]
    })

    autoTable(doc, {
      startY: 32,
      head: [['Key', 'Title', 'Project', 'Status', 'Priority', 'Due Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 8 }
    })

    doc.save(`TaskFlow-Executive-Report-${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success('Generated PDF Report')
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 font-mono">
            <span>WORKSPACE</span>
            <span>/</span>
            <span className="text-[#0284C7] font-bold">EXPORTS & ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            Reports & Telemetry Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border bg-surface hover:bg-muted"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-500" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handleExportPDF}
            className="h-9 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white shadow-md shadow-sky-500/25"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center gap-3 text-xs bg-surface p-3 rounded-xl border border-border/80 shadow-2xs">
        <label className="text-muted-foreground font-semibold">Filter Analytics by Project:</label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="h-8 text-xs font-semibold rounded-lg border border-input bg-background px-3 outline-none"
        >
          <option value="all">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              [{p.identifier}] {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colorful Bar Chart */}
        <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-base text-foreground">
              Contributor Workload & Output Comparison
            </h3>
            <p className="text-xs text-muted-foreground">Assigned vs Completed tasks by team member</p>
          </div>

          {workloadByMember.length ? <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadByMember} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Bar dataKey="assigned" name="Assigned" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-16 text-center text-sm text-muted-foreground">No team members to report.</p>}
        </div>

        {/* Priority Spectrum */}
        <div className="p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-base text-foreground">
              Task Priority & Urgency Distribution
            </h3>
            <p className="text-xs text-muted-foreground">Risk classification breakdown across backlog</p>
          </div>

          {filteredTasks.length ? <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Bar dataKey="count" name="Tasks" fill="#0EA5E9" radius={[0, 6, 6, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-16 text-center text-sm text-muted-foreground">No tasks to report.</p>}
        </div>
      </div>
    </div>
  )
}
