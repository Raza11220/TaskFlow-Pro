import Attachment from '../models/Attachment.js';
import { isCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';
import { ServiceUnavailableError, NotFoundError } from '../utils/errors.js';

export class FileService {
  static async uploadFile(orgId, file, { projectId, taskId, messageId }, uploadedBy) {
    if (!file) throw new Error('No file provided');

    let fileUrl = '';
    let storageKey = '';
    let provider = 'local';

    if (isCloudinaryConfigured) {
      provider = 'cloudinary';
      // In production or when credentials exist, upload buffer to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `taskflow/${orgId}` },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      fileUrl = uploadResult.secure_url;
      storageKey = uploadResult.public_id;
    } else {
      // Local fallback representation
      storageKey = `local-${Date.now()}-${file.originalname}`;
      fileUrl = `/uploads/${storageKey}`;
    }

    const attachment = await Attachment.create({
      organizationId: orgId,
      projectId: projectId || null,
      taskId: taskId || null,
      messageId: messageId || null,
      uploadedBy,
      originalName: file.originalname,
      storageKey,
      url: fileUrl,
      mimeType: file.mimetype,
      size: file.size,
      provider,
    });

    return attachment;
  }

  static async getFiles(orgId, { projectId, page = 1, limit = 50 }) {
    const query = { organizationId: orgId, status: 'active' };
    if (projectId) query.projectId = projectId;

    const skip = (Number(page) - 1) * Number(limit);
    const [files, total] = await Promise.all([
      Attachment.find(query)
        .populate('uploadedBy', 'firstName lastName avatar email')
        .populate('projectId', 'name key')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Attachment.countDocuments(query),
    ]);

    return {
      files: files.map((f) => ({
        id: f._id,
        name: f.originalName,
        size: f.size,
        type: f.mimeType,
        url: f.url,
        projectId: f.projectId?._id,
        projectName: f.projectId?.name,
        uploadedById: f.uploadedBy?._id,
        uploadedByName: f.uploadedBy ? `${f.uploadedBy.firstName} ${f.uploadedBy.lastName}` : 'Unknown',
        uploadedAt: f.createdAt,
      })),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  static async deleteFile(orgId, fileId, actorId) {
    const file = await Attachment.findOne({ _id: fileId, organizationId: orgId });
    if (!file) throw new NotFoundError('File not found');

    file.status = 'deleted';
    await file.save();
    return true;
  }
}

export default FileService;
