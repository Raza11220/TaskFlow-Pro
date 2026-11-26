// ─── Chat Hooks ────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useConversations = () => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['conversations', organizationId],
    queryFn: () => chatService.getConversations(organizationId!),
    enabled: !!organizationId,
    select: (data) => data?.data?.conversations ?? [],
  })
}

export const useMessages = (conversationId: string | null) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['messages', organizationId, conversationId],
    queryFn: () => chatService.getMessages(organizationId!, conversationId!),
    enabled: !!organizationId && !!conversationId,
    select: (data) => data?.data?.messages ?? [],
  })
}

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: Parameters<typeof chatService.sendMessage>[2]) =>
      chatService.sendMessage(organizationId!, conversationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', organizationId, conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations', organizationId] })
    },
    onError: () => toast.error('Failed to send message'),
  })
}

export const useCreateConversation = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (payload: Parameters<typeof chatService.createConversation>[1]) =>
      chatService.createConversation(organizationId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', organizationId] })
      toast.success('Conversation created!')
    },
    onError: () => toast.error('Failed to create conversation'),
  })
}

export const useMarkConversationRead = () => {
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsRead(organizationId!, conversationId),
  })
}
