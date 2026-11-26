import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  Bell,
  Check,
  Moon,
  Palette,
  Shield,
  Sun,
  User,
  Workflow
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export const SettingsPage: React.FC = () => {
  const {
    organization,
    updateOrganization,
    currentUser,
    setCurrentUser
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<
    'profile' | 'appearance' | 'workspace' | 'security' | 'integrations'
  >('profile')

  // Profile local form state
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle)
  const [phone, setPhone] = useState(currentUser.phone)
  const [bio, setBio] = useState(currentUser.bio)

  // Workspace form state
  const [orgName, setOrgName] = useState(organization.name)
  const [location, setLocation] = useState(organization.location)
  const [timezone, setTimezone] = useState(organization.timezone)

  useEffect(() => {
    setName(currentUser.name)
    setEmail(currentUser.email)
    setJobTitle(currentUser.jobTitle)
    setPhone(currentUser.phone)
    setBio(currentUser.bio)
  }, [currentUser.name, currentUser.email, currentUser.jobTitle, currentUser.phone, currentUser.bio])

  useEffect(() => {
    setOrgName(organization.name)
    setLocation(organization.location)
    setTimezone(organization.timezone)
  }, [organization.name, organization.location, organization.timezone])

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentUser({ name, email, jobTitle, phone, bio })
    toast.success('Profile settings updated successfully')
  }

  const handleWorkspaceSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateOrganization({ name: orgName, location, timezone })
    toast.success('Workspace details updated')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-foreground font-medium">Administration</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
          Settings & Preferences
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Secondary Navigation */}
        <div className="space-y-1 text-xs">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
            { id: 'workspace', label: 'Organization Details', icon: Workflow },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'integrations', label: 'Integrations', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-left transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-surface text-[#086F83] dark:text-[#55B6C7] font-semibold border border-border shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            )
          })}

        </div>

        {/* Settings Panel Content */}
        <div className="md:col-span-3 rounded-lg border border-border bg-surface p-5 shadow-xs text-xs space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <UserAvatar user={currentUser} size="lg" />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{currentUser.name}</h3>
                  <p className="text-muted-foreground">{currentUser.email}</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● Role: {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Job Title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Bio & Professional Summary</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              <Button type="submit" size="sm" className="bg-[#086F83] hover:bg-[#075B6C] text-white">
                Save Profile Changes
              </Button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Display & Color System</h3>
              <p className="text-muted-foreground">
                TaskFlow Pro features a high-density, low-glare enterprise theme system.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div
                  onClick={() => document.documentElement.classList.remove('dark')}
                  className="p-4 rounded-lg border border-border hover:border-[#086F83] cursor-pointer bg-white text-zinc-900 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5"><Sun className="w-4 h-4 text-[#086F83]" /> Light Theme</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Clean off-white surfaces with #086F83 brand accents and 1px dividers.
                  </p>
                </div>

                <div
                  onClick={() => document.documentElement.classList.add('dark')}
                  className="p-4 rounded-lg border border-zinc-700 hover:border-[#55B6C7] cursor-pointer bg-[#171A1D] text-zinc-100 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-[#55B6C7]" /> Dark Theme</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Engineered #101214 deep canvas with #55B6C7 calm contrast.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <form onSubmit={handleWorkspaceSave} className="space-y-4">
              <h3 className="text-sm font-semibold">Organization Parameters</h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Organization Name</Label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Default Timezone</Label>
                    <Input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" size="sm" className="bg-[#086F83] text-white">
                Update Workspace
              </Button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Security & Session Management</h3>
              <p className="text-muted-foreground">
                Use the password reset flow to update your account password.
              </p>

              <div className="p-3 bg-muted/40 rounded border border-border text-[11px] space-y-1 text-muted-foreground">
                <div className="font-semibold text-foreground">Signed-in account</div>
                <div>{currentUser.email}</div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">External Connectors</h3>
              <div className="rounded border border-border bg-muted/30 p-4 text-muted-foreground">
                No integrations are connected to this workspace.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
