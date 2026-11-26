import { describe, expect, it } from 'vitest'
import { mapProjectToUi, mapTaskToUi, mapUserToUi } from './mappers'

describe('backend data mappers', () => {
  it('does not invent profile details or online presence', () => {
    const user = mapUserToUi({
      _id: 'user-1',
      firstName: 'Alex',
      lastName: 'Example',
      email: 'alex@example.com',
    })

    expect(user.name).toBe('Alex Example')
    expect(user.department).toBe('')
    expect(user.jobTitle).toBe('')
    expect(user.timezone).toBe('')
    expect(user.status).toBe('Offline')
  })

  it('leaves missing project and task dates empty', () => {
    const project = mapProjectToUi({ _id: 'project-1', name: 'Project', key: 'PRJ' })
    const task = mapTaskToUi({
      _id: 'task-1',
      identifier: 'PRJ-1',
      title: 'Task',
      dueDate: null,
    })

    expect(project.startDate).toBe('')
    expect(project.deadline).toBe('')
    expect(task.dueDate).toBe('')
    expect(task.createdAt).toBe('')
    expect(task.updatedAt).toBe('')
  })
})
