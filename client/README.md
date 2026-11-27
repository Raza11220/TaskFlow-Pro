# 🎨 TaskFlow Pro — Frontend Application

> **Make work flow.** ✨  
> Modern enterprise project management, task tracking, and team collaboration SaaS frontend built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Shadcn UI**, and **Zustand**.

---

## 🧭 1. Overview & Architecture

**TaskFlow Pro** is a SaaS frontend backed by the TaskFlow Pro REST API and Socket.IO services. Workspace content is loaded from the signed-in user's organization; no demo records are bundled with the client. Existing records in the configured MongoDB database remain untouched.

### ✨ Key Architectural Highlights
- 🚀 **Live Workspace Data**: Workspace records are hydrated from the API into Zustand state and cleared from memory when the user signs out. Only UI preferences are persisted locally.
- 🎨 **Enterprise Design System**:
  - **Typography**: `Outfit` (headings), `Plus Jakarta Sans` (interface), `JetBrains Mono` (task keys & badges).
  - **Shell**: Fixed 52px global top bar, 56px primary navigation rail, and collapsible 245px workspace sidebar.
  - **Visual Polish**: Ambient glow accents, subtle micro-interactions, colored Kanban columns, and Light/Dark themes.
- 🔄 **Cross-Module State Sync**: Workspace views use the same live project and task data; audit events are loaded from the backend activity feed.

---

## 📄 2. Implemented Pages & Features

| Route | Page | Key Features |
|---|---|---|
| `/` | 🏠 **Landing Page** | Editorial SaaS marketing page with feature showcases, pricing tiers, and sign-in links. |
| `/login` | 🔐 **Authentication** | Email/password sign-in with password visibility toggle and validation. |
| `/signup` | 📝 **Sign Up** | Multi-field registration with workspace onboarding redirect. |
| `/forgot-password` | 🔑 **Password Recovery** | Backend-driven password recovery. |
| `/onboarding` | 🧭 **Workspace Onboarding** | Multi-step wizard for organization name and optional industry/team-size details. It creates an empty workspace; projects can be added afterward. |
| `/app/dashboard` | 📊 **Workspace Dashboard** | Live metric cards, task activity, status distribution, project progress, and upcoming deadlines. |
| `/app/projects` | 📁 **Projects Directory** | Search, status filters, Grid/Table toggle, create/archive/pin/delete projects. |
| `/app/projects/:projectId` | 🔍 **Project Details** | Sub-navigation (Overview, Work Items, Cycles, Files, Activity, Settings), editable metadata, and team rosters. |
| `/app/tasks` | ✅ **My Tasks** | Filter tabs (Assigned, Created, All, Completed), bulk status actions, inline completion, and priority badges. |
| `/app/board` | 🎯 **Kanban Board** | `@dnd-kit` drag-and-drop across colored columns (Backlog, To Do, In Progress, Review, Done) with quick task drawer. |
| `/app/cycles` | 🔄 **Cycles & Sprints** | Expandable sprint cards with ideal vs. actual burndown AreaCharts and velocity tracking. |
| `/app/timeline` | 📅 **Project Timeline** | Horizontal schedule grid, task duration bars, today marker, and project filtering. |
| `/app/calendar` | 🗓️ **Calendar** | FullCalendar month/week/list views with drag-and-drop rescheduling and task inspection. |
| `/app/chat` | 💬 **Team Chat** | 3-pane text messaging layout with channels, direct messages, and stored voice-message playback. |
| `/app/team` | 👥 **Team Members** | Organization members, role distribution, workload bars, and invite dialog. |
| `/app/reports` | 📈 **Reports & Exports** | Team workload bar charts, priority analytics, **CSV export** (`PapaParse`), and **PDF report generation** (`jsPDF`). |
| `/app/inbox` | 🔔 **Inbox & Notifications** | Unread counters, mark-all-read, filtering, and contextual task navigation. |
| `/app/files` | 📎 **Files & Attachments** | Drag-and-drop upload (`React Dropzone`), project filters, and file management. |
| `/app/activity` | 📜 **Audit Activity Feed** | Date-grouped operational events across tasks, projects, comments, and cycles. |
| `/app/settings` | ⚙️ **Settings** | Profile, Light/Dark theme switcher, organization settings, and connected integrations. |
| `/app/profile` | 👤 **User Profile** | Avatar, department metrics, and assigned task inventory. |
| `/app/access-denied` | 🚫 **Access Denied** | RBAC permission state view. |
| `*` | ❓ **404 Not Found** | Error fallback view with quick navigation back to workspace. |

---

## ⌨️ 3. Global Shortcuts & Power Features

- 🔍 **Command Palette (`Ctrl + K` / `Cmd + K`)**: Search tasks, projects, members, toggle themes, or jump to any route.
- 🗂️ **Task Detail Drawer**: Click any task key or row to edit properties, check off subtasks, and post comments.
- 🌗 **Instant Dark Mode**: Toggle Light/Dark mode from the top navigation bar or Settings.

---

## ⚡ 4. Setup & Development

### 📋 Prerequisites
- **Node.js** `v20.19+` or `v22.12+`
- **npm** or **pnpm**

### 🔧 Environment
Copy `.env.example` to `.env` and check these values:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend REST API base URL; include `/api/v1` (default: `http://localhost:5000/api/v1`). |
| `VITE_SOCKET_URL` | Backend Socket.IO origin (default: `http://localhost:5000`). |

PowerShell: `Copy-Item .env.example .env`. Keep `.env` private and do not commit it.

### 🚀 Commands
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server (http://localhost:5173)
npm run dev

# Run unit tests
npm exec -- vitest run

# Lint & build for production
npm run lint
npm run build
```

The login page currently offers email/password authentication; Google sign-in is not exposed in the shipped UI. New workspaces contain no demo records. Existing database records are not removed by the client.

---

## 🌐 Deploying to Vercel

Deploy the backend as a separate Vercel project first. Replace `https://taskflow-pro-api.vercel.app` in `client/vercel.json` with its actual production origin. The `/api/:path*` proxy must precede the SPA rewrite so cookie-based REST authentication works on the frontend's free domain.

Import the repository as a Vercel project with **Root Directory `client`**, **Framework Preset Vite**, and **Node.js 22.x**. The included `vercel.json` builds with `npm run build`, serves `dist`, and handles deep-link refreshes.

| Production variable | Value |
|---|---|
| `VITE_API_URL` | `/api/v1` |
| `VITE_SOCKET_URL` | `https://<actual-backend-project>.vercel.app` |

Vite variables are embedded at build time. Redeploy after changing them or the proxy destination. Do not use localhost values in Vercel. Without `VITE_API_URL`, production builds default to `/api/v1`; local development keeps `http://localhost:5000/api/v1`.

Update backend `CLIENT_URL` to the actual frontend origin and redeploy the backend. WebSocket connections go directly to the backend with a token fetched through the REST proxy; verify Vercel's WebSocket beta and multi-browser chat on your deployment. See the [root README](../README.md) for the complete Vercel + Atlas setup and production smoke tests.

---

## 🧰 5. Frontend Tech Stack

- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, `tw-animate-css`, CSS custom properties
- **UI & Icons**: Shadcn UI, Base UI, Lucide React
- **State & Forms**: Zustand 5 (`persist`), React Hook Form, Zod
- **Interactions**: `@dnd-kit` (Core, Sortable, Utilities), `cmdk`
- **Charts & Scheduling**: Recharts 3, FullCalendar 6
- **Exports & Uploads**: `jsPDF`, `jsPDF-AutoTable`, `PapaParse`, `React Dropzone`
- **Routing & Toasts**: React Router DOM v7, Sonner
