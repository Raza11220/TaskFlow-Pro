// ─── File Hooks ────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fileService } from '@/services/file.service'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useFiles = (params?: { projectId?: string; taskId?: string }) => {
  const { organizationId } = useAuth()
  return useQuery({
    queryKey: ['files', organizationId, params],
    queryFn: () => fileService.getFiles(organizationId!, params),
    enabled: !!organizationId,
    select: (data) => (Array.isArray(data?.data) ? data.data : data?.data?.files ?? []),
  })
}

export const useUploadFile = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: ({ file, meta }: { file: File; meta: { projectId?: string; taskId?: string } }) =>
      fileService.uploadFile(organizationId!, file, meta),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files', organizationId] })
      toast.success('File uploaded!')
    },
    onError: () => toast.error('Failed to upload file'),
  })
}

export const useDeleteFile = () => {
  const qc = useQueryClient()
  const { organizationId } = useAuth()
  return useMutation({
    mutationFn: (fileId: string) => fileService.deleteFile(organizationId!, fileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['files', organizationId] })
      toast.success('File deleted')
    },
    onError: () => toast.error('Failed to delete file'),
  })
}
