# 🚀 TaskFlow Pro — Enterprise Project Management & Team Collaboration SaaS

> **Make work flow.** ✨  
> A production-oriented, multi-tenant MERN SaaS platform for modern engineering and product teams — combining interactive Kanban boards, sprint cycles, real-time team chat, analytics, and access controls.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## 🌟 Highlights & Core Capabilities

- 🏢 **Multi-Tenant Organizations & RBAC**: Isolated workspaces with role-based permissions (**Admin**, **Project Manager**, **Employee**) and cryptographically secure single-use invitations.
- 📋 **Projects & Atomic Task Tracking**: Auto-generated sequential keys (`MED-001`, `CRM-042`), subtasks, labels, priorities, bulk operations, and enforced status transition workflows.
- 🎯 **Interactive Kanban Board**: Smooth `@dnd-kit` drag-and-drop across columns with optimistic updates and persistent position ordering.
- 🔄 **Sprint Cycles & Burndown**: Track sprint velocity, initial scope, and daily automated burndown snapshots.
- 💬 **Real-Time Team Chat**: 3-pane workspace messaging with channels, DMs, and Socket.IO rooms.
- 📊 **Executive Dashboard & Reports**: Recharts visualizations (velocity trends, status donuts, team workload) with **CSV** (`PapaParse`) and **PDF** (`jsPDF`) exports.
- 📅 **Calendar & Timeline Views**: FullCalendar scheduling (Month/Week/List) and horizontal project Gantt timelines.
- 🔐 **Production Security**: Short-lived JWT access tokens, rotating HttpOnly refresh token cookies with token-family reuse detection, `bcrypt` hashing, Helmet headers, Zod validation, and rate limiting.
- 📚 **Interactive API Docs**: Full OpenAPI/Swagger UI at `/api/docs`. New workspaces start empty and load their data from the backend.

---

## 🗂️ Repository Structure

```text
taskflow-pro/
├── 📁 client/                 # React 19 + TypeScript + Vite + Tailwind CSS v4 frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # Reusable UI primitives (Shadcn / Base UI) & layout shell
│   │   ├── 📁 pages/          # Dashboard, Kanban, Tasks, Cycles, Chat, Calendar, Reports, etc.
│   │   ├── 📁 store/          # Zustand workspace state and UI preference persistence
│   │   └── 📁 services/       # Axios HTTP client configuration
│   └── 📄 README.md           # Frontend-specific documentation
├── 📁 server/                 # Node.js + Express 5 + MongoDB + Socket.IO modular monolith
│   ├── 📁 src/
│   │   ├── 📁 config/         # Env validation (Zod), DB, Logger, Mail, Cloudinary, Swagger
│   │   ├── 📁 constants/      # Roles, permissions matrix, status transitions
│   │   ├── 📁 controllers/    # Thin HTTP request/response handlers
│   │   ├── 📁 jobs/           # Node-cron scheduled tasks (burndown, reminders, cleanup)
│   │   ├── 📁 middleware/     # Auth, RBAC, Zod validation, rate limiting, error handling
│   │   ├── 📁 models/         # 19 Mongoose schemas with compound & TTL indexes
│   │   ├── 📁 routes/         # Versioned REST API v1 endpoints
│   │   ├── 📁 services/       # Business logic & tenant isolation layer
│   │   ├── 📁 sockets/        # Authenticated Socket.IO real-time handlers
│   │   ├── 📁 tests/          # Vitest automated test suite
│   │   ├── 📁 utils/          # Security, errors, pagination & response helpers
│   │   └── 📁 validators/     # Zod input validation schemas
│   ├── 📁 docs/               # Frontend-backend integration guide
│   ├── 📄 Dockerfile          # Multi-stage non-root production container
│   └── 📄 README.md           # Backend-specific documentation
├── 📄 package.json            # Root scripts (concurrently runs client & server)
├── 📄 LICENSE                 # MIT License
└── 📄 README.md               # You are here!
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Shadcn UI, Base UI, Zustand 5, Recharts, FullCalendar, `@dnd-kit`, Lucide Icons, `jsPDF`, `PapaParse` |
| **Backend** | Node.js (ESM), Express 5, MongoDB, Mongoose 9, Socket.IO 4, Zod 4, JWT, `bcrypt`, Multer, Cloudinary, Nodemailer, Node-Cron, Winston, Morgan, Helmet |
| **Testing & Docs** | Vitest, Supertest, MongoDB Memory Server, Swagger JSDoc, Swagger UI Express |
| **DevOps** | Docker (Multi-stage Alpine, non-root user), ESLint, Prettier, Nodemon, Concurrently |

---

## ⚡ Quick Start

### 1️⃣ Prerequisites
- **Node.js** `v20.19+` or `v22.12+`
- **MongoDB** `v6+` (Local instance or MongoDB Atlas)
- **npm** `v9+`

### 2️⃣ Install Dependencies
```bash
# Install dependencies for the root scripts, frontend, and backend
npm install
npm install --prefix client
npm install --prefix server
```

### 3️⃣ Configure Environment Variables
Ensure `server/.env` and `client/.env` are configured from their respective `.env.example` templates:
```bash
# macOS / Linux
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell, use:
```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

Set strong, private JWT secrets in `server/.env` before running the backend. The frontend API URL should include `/api/v1` (the example file already does). Do not commit either `.env` file.

### 4️⃣ Start MongoDB, Register, and Create a Workspace
Start MongoDB (local or Atlas), then create an account in the app and complete workspace onboarding. New workspaces start empty; the repository contains no demo account or seed/reset scripts. Existing records in a configured MongoDB database are not automatically deleted.

### 5️⃣ Run Both Client & Server
```bash
# Runs Vite frontend (http://localhost:5173) & Express backend (http://localhost:5000) concurrently
npm run dev
```

The backend exposes liveness and database-readiness checks at `/api/health` and `/api/ready`. API documentation is available at `/api/docs`.

---

---

## 📜 Root NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run client` | Start only the frontend Vite dev server |
| `npm run server` | Start only the backend Nodemon server |
| `npm run build` | Build the frontend production bundle |
| `npm run start` | Start the backend server in production mode |
| `npm test --prefix server` | Run backend tests |

Run frontend tests from the client directory with `npm exec -- vitest run`.

---

## 🚀 Deployment (Vercel Hobby + MongoDB Atlas)

The client and server deploy as **two Vercel projects from this repository**. Use the Hobby plan within its current usage and eligibility limits; MongoDB Atlas has a separate free cluster option. Configuration alone does not deploy the app or prove production readiness.

### 1. Deploy the backend

1. Create an Atlas cluster and database user. Store the private connection string as `MONGODB_URI`. Configure Atlas Network Access so Vercel functions can connect; Hobby does not provide a dedicated static egress IP. An allow-from-anywhere rule broadens database exposure, so use strong unique credentials and review the network setup before production.
2. Import the repository into Vercel. Use project name `taskflow-pro-api` (or your own), **Root Directory: `server`**, **Framework Preset: Other**, and **Node.js: 22.x**. Keep the included `server/vercel.json`; leave Build Command and Output Directory overrides disabled. The API is a Node function, not a static build, and does not need `npm start`.
3. Add these **Production** environment variables in Vercel:

   | Variable | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Private Atlas connection string |
   | `CLIENT_URL` | Exact frontend origin, e.g. `https://taskflow-pro.vercel.app`, without trailing slash; update after deploying the client |
   | `API_BASE_URL` | Actual backend origin, e.g. `https://taskflow-pro-api.vercel.app`, without `/api/v1` |
   | `JWT_ACCESS_SECRET` | A private random secret, at least 32 characters |
   | `JWT_REFRESH_SECRET` | A different private random secret, at least 32 characters |
   | `CRON_SECRET` | Another private random secret, at least 32 characters, for the daily job |
   | `MAX_FILE_SIZE_MB` | `4` (leave room for multipart overhead under the Hobby request limit) |

   Generate each secret separately with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Configure `SMTP_*` for reset/invitation emails and `CLOUDINARY_*` for hosted file uploads. Keep secrets in Vercel settings; never commit `.env`.
4. Deploy and copy the actual production backend URL. Make the production API publicly reachable by the client; Vercel deployment protection must not block normal application requests. Preview deployments are not configured as production frontends.

### 2. Deploy the frontend

1. In `client/vercel.json`, replace `https://taskflow-pro-api.vercel.app` in the `/api/:path*` rewrite with your **actual backend production origin**. Vite environment variables do not substitute into this JSON file.
2. Import the same repository as another Vercel project, **Root Directory: `client`**, **Framework Preset: Vite**, **Node.js: 22.x**. Build command is `npm run build`; output is `dist`.
3. Set **Production** `VITE_API_URL=/api/v1` and `VITE_SOCKET_URL=https://<actual-backend-project>.vercel.app`. Do not copy the localhost values from `client/.env` into Vercel.
4. Deploy the client, update backend `CLIENT_URL` to its actual frontend origin, then redeploy the backend. Redeploy the client whenever its Vite variables or rewrite destination change.

The frontend `/api/*` rewrite proxies requests to the server before the SPA fallback. REST authentication cookies are therefore first-party on the frontend domain, including free `vercel.app` domains. Socket.IO connects directly to `VITE_SOCKET_URL` with the token obtained through the REST proxy.

### 3. Scheduled jobs, live chat, and limits

- The Vercel entry point `server/api/index.js` exports the HTTP server without opening a listener or starting `node-cron`. MongoDB connections are reused across warm requests; failed attempts can retry. Local `npm run dev` / `npm start` still use the regular listener and timers.
- One authenticated Vercel Cron request to `/api/jobs/daily` runs snapshots, overdue reminders, and invitation cleanup daily at `04:00 UTC` (approximately `09:00 Asia/Karachi`). Set `CRON_SECRET` before deploying. Hobby timing is approximate; the deployed schedule combines the three jobs into one daily run. Large datasets can exceed function duration limits and need batched processing.
- Vercel currently documents WebSocket and Socket.IO support in **Public Beta**. The backend exports its HTTP server and uses WebSocket-only transport on Vercel. Verify availability and reconnection on the deployed account. Socket.IO rooms and rate limits are in memory per function instance; broadcasts across multiple instances require a shared adapter/store before promising reliable scaled real-time delivery.
- Hobby functions accept request bodies up to **4.5 MB**, including multipart/base64 overhead; the old local 10 MB upload setting cannot bypass this. For larger files, implement direct-to-cloud uploads. Cloudinary and email providers have their own quotas.
- Review current [Hobby plan limits](https://vercel.com/docs/plans/hobby), [WebSocket support](https://vercel.com/changelog/websocket-support-is-now-in-public-beta), [function limits](https://vercel.com/docs/functions/limitations), and [daily cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing) before deploying.

### 4. Production smoke tests

1. Open backend `/api/health`, `/api/ready`, `/api/docs`, and `/api/docs.json`; readiness must report a connected database and Swagger must list the routes.
2. Open frontend `/api/health` and a deep link such as `/login` directly; both the proxy and SPA refresh must work.
3. Register, sign in, create a workspace/project/task, reload a protected page, refresh the session, and sign out. Confirm cookies persist through the frontend origin without third-party-cookie exceptions.
4. Test chat between two signed-in browsers, typing events, and reconnection. Check for dropped cross-instance broadcasts.
5. Test configured email and file-upload flows. Check Vercel Cron execution logs and confirm that `/api/jobs/daily` rejects requests without its bearer secret.

Only describe the app as fully production-ready after actual deployment and the relevant production smoke tests pass.

---

## 📖 Detailed Documentation

- 🎨 [**Frontend Documentation (`client/README.md`)**](./client/README.md)
- ⚙️ [**Backend API Documentation (`server/README.md`)**](./server/README.md)
- 🔗 [**Frontend-Backend Integration Guide (`server/docs/FRONTEND_INTEGRATION.md`)**](./server/docs/FRONTEND_INTEGRATION.md)
- 🌐 **Swagger API Explorer**: `http://localhost:5000/api/docs` (when backend is running)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.
