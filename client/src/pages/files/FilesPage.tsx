import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useDropzone } from 'react-dropzone'
import { File, FileText, Image, Plus, Search, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export const FilesPage: React.FC = () => {
  const { files, projects, members, addFile, deleteFile } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      addFile({
        name: file.name,
        size: file.size,
        type: file.type.split('/')[1] || 'document',
        projectId: projects[0]?.id
      }, file)
    })
    toast.success(`Uploaded ${acceptedFiles.length} file(s)`)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const filteredFiles = files.filter(f => {
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-foreground font-medium">Assets</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Files & Attachments
          </h1>
        </div>

        <div className="text-xs text-muted-foreground">
          Local client-side preview mode (Prepared for future cloud storage integration)
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-[#086F83] bg-[#EAF5F7]/40 dark:bg-[#173239]/40'
            : 'border-border hover:border-muted-foreground/60 bg-surface'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-8 h-8 mx-auto text-[#086F83] dark:text-[#55B6C7] mb-2" />
        <p className="text-xs font-medium text-foreground">
          Drag and drop local files here, or click to browse
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Supports PDF, PNG, JPG, CSV, Figma and JSON files up to 25MB
        </p>
      </div>

      {/* Files Table */}
      <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="h-7 text-xs pl-8"
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {filteredFiles.length} files
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4 font-semibold">File Name</th>
                <th className="py-2.5 px-3 font-semibold">Associated Project</th>
                <th className="py-2.5 px-3 font-semibold">Size</th>
                <th className="py-2.5 px-3 font-semibold">Uploaded By</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.map((file) => {
                const prj = projects.find(p => p.id === file.projectId)
                const uploader = members.find(m => m.id === file.uploadedById)

                return (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#086F83]" />
                        <span className="truncate max-w-[280px] font-mono">{file.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground">
                      {prj ? `${prj.name} [${prj.identifier}]` : 'Workspace General'}
                    </td>

                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {uploader && <UserAvatar user={uploader} size="xs" />}
                        <span className="text-muted-foreground">{uploader?.name || 'Staff'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {file.uploadedAt}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          deleteFile(file.id)
                          toast.success(`Deleted ${file.name}`)
                        }}
                        className="text-muted-foreground hover:text-red-600 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
