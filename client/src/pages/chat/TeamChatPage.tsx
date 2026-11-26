import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  Hash,
  MessageSquare,
  Search,
  Send,
  Trash2,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// Helper component for playing back voice notes
const VoiceMessagePlayer: React.FC<{
  audioUrl: string
  isSenderMe?: boolean
}> = ({ audioUrl, isSenderMe }) => (
    <div className={`flex items-center gap-3 p-2.5 rounded-2xl max-w-sm border transition-all ${
      isSenderMe
        ? 'bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border-sky-500/30'
        : 'bg-muted/40 border-border/80'
    }`}>
      <audio
        controls
        preload="none"
        src={audioUrl}
        onError={() => toast.error('Unable to play this voice message.')}
        className="h-9 w-full"
      />
    </div>
)

export const TeamChatPage: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    deleteMessage,
    members,
    currentUser
  } = useAppStore()

  const [inputContent, setInputContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0]
  const currentMessages = messages[activeConv?.id] || []
  const convMembers = members.filter(m => activeConv?.participantIds.includes(m.id))

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConv || !inputContent.trim()) return
    sendMessage(activeConv.id, inputContent.trim())
    setInputContent('')
  }

  const channels = conversations.filter(c => c.type === 'channel')
  const directMessages = conversations.filter(c => c.type === 'direct')

  return (
    <div className="flex-1 flex overflow-hidden bg-background h-full">
      {/* Panel 1: Channels & DMs Navigation */}
      <div className="w-68 border-r border-border/80 bg-sidebar flex flex-col shrink-0 select-none text-xs">
        {/* Search */}
        <div className="p-3.5 border-b border-border/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chatrooms..."
              className="h-8 text-xs pl-8.5 rounded-xl bg-surface border-border shadow-2xs"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scroll">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2 block font-mono">
              COLLABORATION CHANNELS
            </span>
            <div className="space-y-1">
              {channels.map((conv) => {
                const isActive = conv.id === activeConv?.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-[#0284C7] dark:text-[#38BDF8] font-bold shadow-2xs border border-sky-500/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0284C7]' : 'text-muted-foreground'}`} />
                      <span className="truncate">{conv.name.replace('# ', '')}</span>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="font-mono text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-bold shadow-2xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2 block font-mono">
              DIRECT MESSAGES
            </span>
            <div className="space-y-1">
              {directMessages.map((conv) => {
                const isActive = conv.id === activeConv?.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/10 text-[#0284C7] dark:text-[#38BDF8] font-bold shadow-2xs border border-sky-500/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/50" />
                      <span className="truncate">{conv.name}</span>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="font-mono text-[10px] px-2 py-0.2 rounded-full bg-rose-500 text-white font-bold shadow-2xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          {conversations.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">No conversations are available.</p>
          )}
        </div>
      </div>

      {/* Panel 2: Main Active Conversation Stream */}
      <div className="flex-1 flex flex-col bg-surface overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 border-b border-border/80 px-6 flex items-center justify-between shrink-0 bg-surface/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="font-heading font-extrabold text-base text-foreground flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[#0284C7]" />
              <span>{activeConv ? activeConv.name.replace('# ', '') : 'No conversation selected'}</span>
            </span>
            {activeConv?.description && (
              <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-sm">
                — {activeConv.description}
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/80">
            <Users className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{convMembers.length} Members</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll">
          {!activeConv ? (
            <div className="text-center py-16 text-muted-foreground text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#0284C7]" />
              <p>No conversations are available in this workspace.</p>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-xs space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-[#0284C7]" />
              <p className="font-semibold text-foreground">Welcome to {activeConv.name}!</p>
              <p>This is the start of the conversation. Send a message to coordinate with your team.</p>
            </div>
          ) : (
            currentMessages.map((msg) => {
              const sender = members.find(m => m.id === msg.senderId)
              const isMe = msg.senderId === currentUser.id

              return (
                <div key={msg.id} className="flex gap-3.5 text-xs group items-start">
                  <UserAvatar user={sender} size="sm" showStatus />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-foreground text-xs">{sender?.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {msg.timestamp}
                      </span>
                      {isMe && (
                        <button
                          onClick={() => deleteMessage(activeConv.id, msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-600 transition-opacity p-0.5 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {msg.isVoice && msg.audioUrl ? (
                      <VoiceMessagePlayer
                        audioUrl={msg.audioUrl}
                        isSenderMe={isMe}
                      />
                    ) : msg.isVoice ? (
                      <p className="text-xs text-muted-foreground">Voice recording is unavailable.</p>
                    ) : (
                      <div className="text-foreground/90 leading-relaxed bg-muted/30 border border-border/60 p-3 rounded-2xl inline-block max-w-2xl shadow-2xs">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input Bar */}
        <div className="p-4 border-t border-border/80 bg-background">
          {activeConv ? (
            <form onSubmit={handleSend} className="flex items-center gap-2.5">
              <Input
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`Send message in ${activeConv.name}...`}
                className="h-9.5 text-xs flex-1 rounded-xl bg-surface border-border px-4 shadow-2xs"
              />
              <Button
                type="submit"
                size="xs"
                disabled={!inputContent.trim()}
                className="h-9.5 px-4 bg-gradient-to-r from-[#0284C7] to-indigo-600 hover:from-[#0369A1] hover:to-indigo-700 text-white rounded-xl shadow-sm shadow-sky-500/25 font-bold cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </form>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Messaging is unavailable until a conversation is added.</p>
          )}
        </div>
      </div>

      {/* Panel 3: Channel Info Details */}
      <div className="w-64 border-l border-border/80 bg-sidebar p-4 hidden lg:flex flex-col select-none text-xs space-y-5">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
            ROOM SPECIFICATIONS
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {activeConv?.description || 'No conversation details available.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5 font-mono">
            ACTIVE PARTICIPANTS ({convMembers.length})
          </h4>
          <div className="space-y-2.5">
            {convMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-muted/40 transition-colors">
                <UserAvatar user={m} size="xs" showStatus />
                <div className="truncate">
                  <div className="font-semibold text-foreground truncate text-xs">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{m.jobTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
