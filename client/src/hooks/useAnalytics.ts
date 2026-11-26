// ─── Analytics Hooks ───────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import { useAuth } from '@/context/AuthContext'

export const useAnalyticsOverview = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['analytics-overview', organizationId],
    queryFn: () => analyticsService.getOverview(organizationId!),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data?.data,
  })
}

export const useWorkload = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['workload', organizationId],
    queryFn: () => analyticsService.getWorkload(organizationId!),
    enabled: !!organizationId,
    select: (data) => data?.data?.workload ?? [],
  })
}

export const useWeeklyActivity = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['weekly-activity', organizationId],
    queryFn: () => analyticsService.getWeeklyActivity(organizationId!),
    enabled: !!organizationId,
    select: (data) => data?.data?.weekly ?? data?.data?.activity ?? [],
  })
}

export const useActivityLog = (params?: { page?: number; limit?: number; projectId?: string }) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['activity-log', organizationId, params],
    queryFn: () => analyticsService.getActivity(organizationId!, params),
    enabled: !!organizationId,
    select: (data) => (Array.isArray(data?.data) ? data.data : []),
  })
}
