// ─── Notification Hooks ────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useNotifications = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['notifications', organizationId],
    queryFn: () => notificationService.getNotifications(organizationId!),
    enabled: !!organizationId,
    refetchInterval: 30000, // poll every 30s
    select: (data) => (Array.isArray(data?.data) ? data.data : data?.data?.notifications ?? []),
  })
}

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(organizationId!, notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', organizationId] }),
  })
}

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(organizationId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', organizationId] })
      toast.success('All notifications marked as read')
    },
  })
}

export const useDeleteNotification = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(organizationId!, notificationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', organizationId] }),
  })
}
