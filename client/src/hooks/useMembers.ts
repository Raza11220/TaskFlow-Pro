// ─── Members Hooks ─────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '@/services/organization.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useMembers = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: () => organizationService.getMembers(organizationId!),
    enabled: !!organizationId,
    select: (data) => (Array.isArray(data?.data) ? data.data : data?.data?.members ?? []),
  })
}

export const useInviteMember = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: { email: string; role: string }) =>
      organizationService.inviteMember(organizationId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', organizationId] })
      toast.success('Invitation sent!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to invite member'
      toast.error(msg)
    },
  })
}

export const useUpdateMemberRole = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      organizationService.updateMemberRole(organizationId!, memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', organizationId] })
      toast.success('Role updated!')
    },
    onError: () => toast.error('Failed to update role'),
  })
}

export const useRemoveMember = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (memberId: string) => organizationService.removeMember(organizationId!, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', organizationId] })
      toast.success('Member removed')
    },
    onError: () => toast.error('Failed to remove member'),
  })
}
