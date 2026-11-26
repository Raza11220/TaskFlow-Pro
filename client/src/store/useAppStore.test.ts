import { describe, it, expect, afterEach } from 'vitest'
import { useAppStore } from './useAppStore'

describe('TaskFlow Pro Zustand State Store', () => {
  afterEach(() => {
    useAppStore.getState().clearWorkspace()
  })

  it('starts without bundled workspace records', () => {
    const state = useAppStore.getState()
    expect(state.projects).toEqual([])
    expect(state.tasks).toEqual([])
    expect(state.members).toEqual([])
    expect(state.conversations).toEqual([])
    expect(state.notifications).toEqual([])
  })

  it('clears workspace records when the session ends', () => {
    useAppStore.getState().addProject({
      name: 'Workspace project',
      identifier: 'WP',
      description: '',
      leadId: '',
      memberIds: [],
      status: 'Active',
      progress: 0,
      startDate: '',
      deadline: '',
      category: '',
      isFavorite: false,
    })

    useAppStore.getState().clearWorkspace()

    expect(useAppStore.getState().projects).toEqual([])
    expect(useAppStore.getState().organizationId).toBeNull()
    expect(useAppStore.getState().isSynced).toBe(false)
  })

  it('updates a task without adding an unpersisted activity record', () => {
    const task = {
      id: 'task-1',
      identifier: 'TASK-1',
      title: 'Update account settings',
      description: '',
      status: 'In Progress' as const,
      priority: 'Medium' as const,
      projectId: 'project-1',
      assigneeIds: [],
      creatorId: '',
      dueDate: '2026-12-01',
      labels: [],
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: '2026-11-26T00:00:00.000Z',
      updatedAt: '2026-11-26T00:00:00.000Z',
    }
    useAppStore.setState({ tasks: [task] })

    useAppStore.getState().updateTaskStatus(task.id, 'Done')

    const updatedTask = useAppStore.getState().tasks.find(t => t.id === task.id)
    expect(updatedTask?.status).toBe('Done')

    expect(useAppStore.getState().activities).toEqual([])
  })

  it('supports adding a new project with identifier and reflects in state', () => {
    const { addProject } = useAppStore.getState()
    const newPrj = addProject({
      name: 'Smart Grid Telemetry',
      identifier: 'SGT',
      description: 'Distributed IoT monitoring for regional power grids',
      leadId: 'u-1',
      memberIds: ['u-1', 'u-3'],
      status: 'Active',
      progress: 0,
      startDate: '2026-03-01',
      deadline: '2026-08-30'
    })

    expect(newPrj.id).toBeDefined()
    expect(newPrj.identifier).toBe('SGT')
    expect(useAppStore.getState().projects.some(p => p.id === newPrj.id)).toBe(true)
  })

})
