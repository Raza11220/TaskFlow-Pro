import React, { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { projectService } from '@/services/project.service'
import { taskService } from '@/services/task.service'
import { cycleService } from '@/services/cycle.service'
import { organizationService } from '@/services/organization.service'
import { chatService } from '@/services/chat.service'
import { notificationService } from '@/services/notification.service'
import { fileService } from '@/services/file.service'
import { analyticsService } from '@/services/analytics.service'
import { getSocket, joinConversation, leaveConversation } from '@/services/socket'
import { toast } from 'sonner'
import {
  mapUserToUi,
  mapProjectToUi,
  mapTaskToUi,
  mapCycleToUi,
  mapConversationToUi,
  mapMessageToUi,
  mapNotificationToUi,
  mapActivityToUi,
  mapFileToUi,
} from '@/utils/mappers'

export const WorkspaceSync: React.FC = () => {
  const { user, organization, organizationId } = useAuth()
  const {
    hydrateWorkspace,
    setSyncing,
    activeConversationId,
    setConversationMessages,
    appendIncomingMessage,
  } = useAppStore()

  // Initial workspace hydration from MongoDB
  useEffect(() => {
    if (!organizationId || !user) return

    let cancelled = false
    const syncAll = async () => {
      setSyncing(true)
      try {
        const [
          orgRes,
          membersRes,
          projectsRes,
          tasksRes,
          cyclesRes,
          convsRes,
          notifsRes,
          activityRes,
          filesRes,
        ] = await Promise.allSettled([
          organizationService.getOrganization(organizationId),
          organizationService.getMembers(organizationId, { limit: 100 }),
          projectService.getProjects(organizationId, { limit: 100 }),
          taskService.getTasks(organizationId, { limit: 200 }),
          cycleService.getCycles(organizationId),
          chatService.getConversations(organizationId),
          notificationService.getNotifications(organizationId, { limit: 50 }),
          analyticsService.getActivity(organizationId, { limit: 50 }),
          fileService.getFiles(organizationId, { limit: 100 }),
        ])

        if (cancelled) return

        const failedResources = [
          { name: 'organization', result: orgRes },
          { name: 'team members', result: membersRes },
          { name: 'projects', result: projectsRes },
          { name: 'tasks', result: tasksRes },
          { name: 'cycles', result: cyclesRes },
          { name: 'conversations', result: convsRes },
          { name: 'notifications', result: notifsRes },
          { name: 'activity', result: activityRes },
          { name: 'files', result: filesRes },
        ].filter(({ result }) => result.status === 'rejected').map(({ name }) => name)
        if (failedResources.length > 0) {
          toast.error(`Failed to load ${failedResources.join(', ')}. Some workspace data may be unavailable.`)
        }

        const orgDoc =
          orgRes.status === 'fulfilled' ? orgRes.value?.data?.organization : null

        const membersRaw =
          membersRes.status === 'fulfilled'
            ? Array.isArray(membersRes.value?.data)
              ? membersRes.value.data
              : membersRes.value?.data?.members || []
            : []

        const projectsRaw =
          projectsRes.status === 'fulfilled'
            ? Array.isArray(projectsRes.value?.data)
              ? projectsRes.value.data
              : projectsRes.value?.data?.projects || []
            : []

        const tasksRaw =
          tasksRes.status === 'fulfilled'
            ? Array.isArray(tasksRes.value?.data)
              ? tasksRes.value.data
              : tasksRes.value?.data?.tasks || []
            : []

        const cyclesRaw =
          cyclesRes.status === 'fulfilled' ? cyclesRes.value?.data?.cycles || [] : []

        const convsRaw =
          convsRes.status === 'fulfilled' ? convsRes.value?.data?.conversations || [] : []

        const notifsRaw =
          notifsRes.status === 'fulfilled'
            ? Array.isArray(notifsRes.value?.data)
              ? notifsRes.value.data
              : []
            : []

        const activitiesRaw =
          activityRes.status === 'fulfilled'
            ? Array.isArray(activityRes.value?.data)
              ? activityRes.value.data
              : []
            : []

        const filesRaw =
          filesRes.status === 'fulfilled'
            ? Array.isArray(filesRes.value?.data)
              ? filesRes.value.data
              : []
            : []

        const mappedMembers = membersRaw.map((m: Record<string, unknown>) => mapUserToUi(m))
        const currentMember = mappedMembers.find((m: { id: string }) => m.id === user.id)
        const mappedCurrentUser =
          currentMember ||
          mapUserToUi(user as unknown as Record<string, unknown>, user.role)

        const mappedConvs = convsRaw.map((c: Record<string, unknown>) =>
          mapConversationToUi(c)
        )

        // Fetch initial messages for first conversation if available
        const initialMessages: Record<string, ReturnType<typeof mapMessageToUi>[]> = {}
        if (mappedConvs.length > 0) {
          try {
            const msgRes = await chatService.getMessages(organizationId, mappedConvs[0].id)
            const msgsRaw = msgRes?.data?.messages || []
            initialMessages[mappedConvs[0].id] = msgsRaw.map((m: Record<string, unknown>) =>
              mapMessageToUi(m)
            )
          } catch {
            toast.error('Failed to load conversation messages.')
          }
        }

        if (cancelled) return

        hydrateWorkspace({
          organizationId,
          currentUser: mappedCurrentUser,
          organization: orgDoc
            ? {
              name: orgDoc.name || organization?.name || '',
              domain: orgDoc.slug || '',
              location: orgDoc.location || '',
              timezone: orgDoc.timezone || '',
              }
            : organization
              ? { name: organization.name }
              : undefined,
          members: mappedMembers,
          projects: projectsRaw.map((p: Record<string, unknown>) => mapProjectToUi(p)),
          tasks: tasksRaw.map((t: Record<string, unknown>) => mapTaskToUi(t)),
          cycles: cyclesRaw.map((c: Record<string, unknown>) => mapCycleToUi(c)),
          conversations: mappedConvs,
          messages: initialMessages,
          notifications: notifsRaw.map((n: Record<string, unknown>) => mapNotificationToUi(n)),
          activities: activitiesRaw.map((a: Record<string, unknown>) => mapActivityToUi(a)),
          files: filesRaw.map((f: Record<string, unknown>) => mapFileToUi(f)),
        })
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    syncAll()
    return () => {
      cancelled = true
    }
  }, [organizationId, user?.id])

  // Load messages when active conversation changes + join Socket.IO room
  useEffect(() => {
    if (!organizationId || !activeConversationId || activeConversationId.startsWith('conv-')) {
      return
    }

    joinConversation(activeConversationId)
    chatService
      .getMessages(organizationId, activeConversationId)
      .then((res) => {
        const msgsRaw = res?.data?.messages || []
        setConversationMessages(
          activeConversationId,
          msgsRaw.map((m: Record<string, unknown>) => mapMessageToUi(m))
        )
      })
      .catch(() => toast.error('Failed to load conversation messages.'))

    return () => {
      leaveConversation(activeConversationId)
    }
  }, [organizationId, activeConversationId])

  // Real-time Socket.IO listeners
  useEffect(() => {
    if (!organizationId) return
    const socket = getSocket()

    const handleNewMessage = (payload: { message?: Record<string, unknown> }) => {
      if (payload?.message) {
        appendIncomingMessage(mapMessageToUi(payload.message))
      }
    }

    socket.on('message:new', handleNewMessage)
    return () => {
      socket.off('message:new', handleNewMessage)
    }
  }, [organizationId])

  return null
}
