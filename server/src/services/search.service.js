import Project from '../models/Project.js';
import Task from '../models/Task.js';
import OrganizationMember from '../models/OrganizationMember.js';
import Attachment from '../models/Attachment.js';

export class SearchService {
  static async globalSearch(orgId, query, userId) {
    if (!query || query.trim().length < 2) {
      return { projects: [], tasks: [], members: [], files: [] };
    }

    const safeRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [projects, tasks, members, files] = await Promise.all([
      Project.find({
        organizationId: orgId,
        archivedAt: null,
        $or: [{ name: safeRegex }, { key: safeRegex }, { description: safeRegex }],
      }).limit(10),

      Task.find({
        organizationId: orgId,
        archivedAt: null,
        $or: [{ title: safeRegex }, { identifier: safeRegex }, { description: safeRegex }],
      })
        .populate('projectId', 'name key color')
        .limit(15),

      OrganizationMember.find({
        organizationId: orgId,
        status: 'active',
      })
        .populate('userId', 'firstName lastName email avatar jobTitle department')
        .limit(10),

      Attachment.find({
        organizationId: orgId,
        status: 'active',
        originalName: safeRegex,
      }).limit(10),
    ]);

    const filteredMembers = members
      .filter((m) => {
        const u = m.userId;
        return (
          u &&
          (u.firstName.match(safeRegex) ||
            u.lastName.match(safeRegex) ||
            u.email.match(safeRegex))
        );
      })
      .map((m) => ({
        id: m.userId._id,
        name: `${m.userId.firstName} ${m.userId.lastName}`,
        email: m.userId.email,
        jobTitle: m.userId.jobTitle,
        avatar: m.userId.avatar,
      }));

    return {
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        key: p.key,
        color: p.color,
      })),
      tasks: tasks.map((t) => ({
        id: t._id,
        identifier: t.identifier,
        title: t.title,
        status: t.status,
        projectName: t.projectId?.name,
      })),
      members: filteredMembers,
      files: files.map((f) => ({
        id: f._id,
        name: f.originalName,
        url: f.url,
        size: f.size,
      })),
    };
  }
}

export default SearchService;
