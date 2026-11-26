// ─── Project Hooks ─────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/services/project.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useProjects = (params?: { status?: string }) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['projects', organizationId, params],
    queryFn: () => projectService.getProjects(organizationId!, params),
    enabled: !!organizationId,
    select: (data) => (Array.isArray(data?.data) ? data.data : data?.data?.projects ?? []),
  })
}

export const useProject = (projectId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['project', organizationId, projectId],
    queryFn: () => projectService.getProject(organizationId!, projectId!),
    enabled: !!organizationId && !!projectId,
    select: (data) => data?.data?.project,
  })
}

export const useCreateProject = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: Parameters<typeof projectService.createProject>[1]) =>
      projectService.createProject(organizationId!, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects', organizationId] })
      toast.success(`Project "${data?.data?.project?.name}" created!`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create project'
      toast.error(msg)
    },
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: Record<string, unknown> }) =>
      projectService.updateProject(organizationId!, projectId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', organizationId] })
      qc.invalidateQueries({ queryKey: ['project', organizationId, vars.projectId] })
      toast.success('Project updated!')
    },
    onError: () => toast.error('Failed to update project'),
  })
}

export const useArchiveProject = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (projectId: string) => projectService.archiveProject(organizationId!, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', organizationId] })
      toast.success('Project archived')
    },
    onError: () => toast.error('Failed to archive project'),
  })
}

export const useRestoreProject = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (projectId: string) => projectService.restoreProject(organizationId!, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', organizationId] })
      toast.success('Project restored')
    },
    onError: () => toast.error('Failed to restore project'),
  })
}
