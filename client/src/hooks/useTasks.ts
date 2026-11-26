// ─── Task Hooks ────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@/services/task.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useTasks = (params?: {
  projectId?: string
  assigneeId?: string
  status?: string
  priority?: string
  cycleId?: string
}) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['tasks', organizationId, params],
    queryFn: () => taskService.getTasks(organizationId!, params),
    enabled: !!organizationId,
    select: (data) => (Array.isArray(data?.data) ? data.data : data?.data?.tasks ?? []),
  })
}

export const useTask = (taskId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['task', organizationId, taskId],
    queryFn: () => taskService.getTask(organizationId!, taskId!),
    enabled: !!organizationId && !!taskId,
    select: (data) => data?.data?.task,
  })
}

export const useCreateTask = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: Parameters<typeof taskService.createTask>[1]) =>
      taskService.createTask(organizationId!, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks', organizationId] })
      qc.invalidateQueries({ queryKey: ['board', organizationId] })
      toast.success(`Task ${data?.data?.task?.identifier} created!`)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create task'
      toast.error(msg)
    },
  })
}

export const useUpdateTask = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Record<string, unknown> }) =>
      taskService.updateTask(organizationId!, taskId, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', organizationId] })
      qc.invalidateQueries({ queryKey: ['task', organizationId, vars.taskId] })
      qc.invalidateQueries({ queryKey: ['board', organizationId] })
    },
    onError: () => toast.error('Failed to update task'),
  })
}

export const useUpdateTaskStatus = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskService.updateTaskStatus(organizationId!, taskId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', organizationId] })
      qc.invalidateQueries({ queryKey: ['board', organizationId] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid status transition'
      toast.error(msg)
    },
  })
}

export const useDeleteTask = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(organizationId!, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', organizationId] })
      qc.invalidateQueries({ queryKey: ['board', organizationId] })
      toast.success('Task deleted')
    },
    onError: () => toast.error('Failed to delete task'),
  })
}

export const useBoard = (projectId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['board', organizationId, projectId],
    queryFn: () => taskService.getBoard(organizationId!, projectId!),
    enabled: !!organizationId && !!projectId,
    select: (data) => data?.data?.board,
  })
}

export const useTaskComments = (taskId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['comments', organizationId, taskId],
    queryFn: () => taskService.getComments(organizationId!, taskId!),
    enabled: !!organizationId && !!taskId,
    select: (data) => data?.data?.comments ?? [],
  })
}

export const useAddComment = (taskId: string) => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (content: string) => taskService.addComment(organizationId!, taskId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', organizationId, taskId] }),
    onError: () => toast.error('Failed to add comment'),
  })
}
