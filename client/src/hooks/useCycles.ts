// ─── Cycle Hooks ───────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cycleService } from '@/services/cycle.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useCycles = (projectId?: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['cycles', organizationId, projectId || 'all'],
    queryFn: () => cycleService.getCycles(organizationId!, projectId || undefined),
    enabled: !!organizationId,
    select: (data) => data?.data?.cycles ?? [],
  })
}

export const useAllCycles = () => useCycles(undefined)

export const useCreateCycle = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: Parameters<typeof cycleService.createCycle>[1]) =>
      cycleService.createCycle(organizationId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', organizationId] })
      toast.success('Cycle created!')
    },
    onError: () => toast.error('Failed to create cycle'),
  })
}

export const useStartCycle = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (cycleId: string) => cycleService.startCycle(organizationId!, cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', organizationId] })
      toast.success('Cycle started!')
    },
    onError: () => toast.error('Failed to start cycle'),
  })
}

export const useCompleteCycle = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (cycleId: string) => cycleService.completeCycle(organizationId!, cycleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cycles', organizationId] })
      toast.success('Cycle completed!')
    },
    onError: () => toast.error('Failed to complete cycle'),
  })
}

export const useBurndown = (cycleId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['burndown', organizationId, cycleId],
    queryFn: () => cycleService.getBurndown(organizationId!, cycleId!),
    enabled: !!organizationId && !!cycleId,
    select: (data) => data?.data?.burndown ?? [],
  })
}
