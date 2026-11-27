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

## 🚀 Production Deployment (Vercel + Render + MongoDB Atlas)

Deployment configuration is included in [`render.yaml`](./render.yaml) for the API and [`client/vercel.json`](./client/vercel.json) for the Vite single-page app. These files prepare the services; they do not create accounts, provision MongoDB, or deploy anything.

1. Create a MongoDB Atlas production cluster and database. Add a database user and allow network access only from the Render service's outbound IP addresses where your Render plan provides stable egress IPs. Do not use an unrestricted `0.0.0.0/0` rule for production. Keep the connection string private and URL-encode special characters in its password.
2. Import this repository into Render and deploy the Blueprint from `render.yaml`. In the service environment, provide:
   - `MONGODB_URI`: the Atlas connection string for the production database.
   - `CLIENT_URL`: the exact deployed frontend origin, such as `https://your-app.vercel.app` (no trailing slash).
   - `API_BASE_URL`: the Render API origin, such as `https://taskflow-pro-api.onrender.com` (no `/api/v1` suffix).
   - Render generates `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` for the service.
3. Create a Vercel project from this repository and set its **Root Directory** to `client`. Configure these build-time environment variables for Production:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api/v1`
   - `VITE_SOCKET_URL`: `https://<your-render-service>.onrender.com`
   Deploy the frontend, then update Render's `CLIENT_URL` to the actual Vercel origin. Redeploy the frontend if its environment variables change.
4. Verify the API at `/api/health`, `/api/ready`, and `/api/docs`, then test sign-in, refresh after reload, workspace data, file upload if configured, and live chat/socket reconnection.

**Important production limits:** Vercel and Render default domains are different sites. This app authenticates with `HttpOnly` cookies, so browsers that block third-party cookies may prevent login/refresh from working across those domains. Use a custom domain with frontend and API subdomains on the same registrable domain (for example `app.example.com` and `api.example.com`) for reliable production authentication; configure the exact frontend origin in `CLIENT_URL` and use the API subdomain in both Vite variables. Password-reset and invitation emails also require working `SMTP_*` settings, and cloud file uploads require `CLOUDINARY_*`. Never commit production credentials or copy a local `.env` into the repository.

---

## 📖 Detailed Documentation

- 🎨 [**Frontend Documentation (`client/README.md`)**](./client/README.md)
- ⚙️ [**Backend API Documentation (`server/README.md`)**](./server/README.md)
- 🔗 [**Frontend-Backend Integration Guide (`server/docs/FRONTEND_INTEGRATION.md`)**](./server/docs/FRONTEND_INTEGRATION.md)
- 🌐 **Swagger API Explorer**: `http://localhost:5000/api/docs` (when backend is running)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.
