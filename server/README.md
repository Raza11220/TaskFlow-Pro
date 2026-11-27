# ⚙️ TaskFlow Pro — Backend API

> **Enterprise-grade, multi-tenant SaaS backend** engineered with **Node.js (ESM)**, **Express 5**, **MongoDB**, **Mongoose 9**, **Zod**, and **Socket.IO**.

---

## ✨ Core Features

- 🏢 **Multi-Tenant Architecture & RBAC**: Strict organization-level tenant isolation (`organizationId`), role hierarchy (**Admin**, **Project Manager**, **Employee**), permission guards, and cryptographically secure single-use invitations.
- 🔐 **Authentication & Session Security**: Short-lived JWT access tokens, rotating HttpOnly refresh token cookies, SHA-256 token hashing, token-family reuse detection, `bcrypt` password hashing, and session revocation (`logout-all`).
- 📋 **Projects & Atomic Tasks**: Concurrent-safe atomic counters for task identifiers (`MED-001`, `CRM-042`), enforced workflow status transitions, subtasks, labels, duplication, and bulk operations.
- 🎯 **Kanban Board Engine**: Column-grouped board views and atomic bulk position reordering.
- 🔄 **Sprint Cycles & Burndown**: Initial scope tracking, progress derivation from tasks, and automated daily cycle snapshots.
- 💬 **Real-Time Collaboration (Socket.IO)**: Authenticated WebSocket handshake, tenant-scoped rooms (`user:`, `org:`, `conversation:`), typing indicators, and persistent text & voice message support.
- 📊 **Dashboard & Analytics**: MongoDB aggregation pipelines for completion rates, member workloads, priority/status breakdowns, and weekly activity.
- 📎 **File Management**: Multer memory uploads with Cloudinary v2 integration and safe fallback handling.
- ⏰ **Background Jobs (`node-cron`)**: Idempotent scheduled jobs for daily burndown snapshots, overdue task reminders, and expired invitation cleanup.
- 📖 **Interactive Swagger Docs**: Full OpenAPI 3.0 specification served at `/api/docs`.
- 🧹 **No Demo Seeding**: The repository does not include demo accounts or seed/reset scripts. Existing MongoDB records are not changed automatically.

---

## 🗂️ Architecture

```text
HTTP Request → Helmet / CORS / RateLimit → Auth & Org RBAC Middleware → Zod Validator → Controller → Service → Mongoose Model → MongoDB
```

---

## ⚡ Setup & Running Locally

### Prerequisites
- **Node.js** `v20.19+` or `v22.12+`
- **MongoDB** `v6+` (local instance or MongoDB Atlas)
- **npm** `v9+`

### 1️⃣ Install Dependencies
```bash
cd server
npm install
```

### 2️⃣ Configure Environment
Copy `.env.example` to `.env` and fill in your secrets:
```bash
# macOS / Linux
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`.

Replace both example JWT secrets with strong private values before starting the server. Keep `.env` private and do not commit it.

| Variable | Required | Default / Example | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Environment (`development`, `test`, `production`) |
| `PORT` | No | `5000` | Server listening port |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS frontend origin |
| `API_BASE_URL` | No | `http://localhost:5000` | Base URL for Swagger server config |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/taskflow_pro` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | *(min 16 chars)* | Secret key for signing access JWTs |
| `JWT_REFRESH_SECRET` | **Yes** | *(min 16 chars)* | Secret key for signing refresh JWTs |
| `GOOGLE_CLIENT_ID` | No | *(empty)* | Google OAuth web client ID; required to enable Google sign-in |
| `CLOUDINARY_*` | No | *(empty)* | Optional Cloudinary credentials for cloud uploads |
| `SMTP_*` | No | *(empty)* | SMTP credentials; email-dependent features are unavailable unless configured |

### Optional Google OAuth API

The backend exposes a Google sign-in endpoint, but the current frontend login page uses email/password and does not display a Google sign-in button. To integrate the endpoint in a custom client, configure `GOOGLE_CLIENT_ID` in `server/.env` with the OAuth web client ID; the server verifies Google ID tokens and does not require a client secret.

### 3️⃣ Start the Server
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

Ensure MongoDB is available before starting the API. Start the frontend separately from the repository root with `npm run client`, or start both applications with the root `npm run dev` command.

Password recovery and email invitations require valid `SMTP_*` settings. Without SMTP, those email-dependent operations return a service-unavailable error; other API routes remain available.

### 4️⃣ Explore API Documentation & Health Probes
- 📚 **Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- 💚 **Liveness Probe**: `GET http://localhost:5000/api/health`
- 🗄️ **Readiness Probe**: `GET http://localhost:5000/api/ready`

---

## ☁️ Deploying to Render

The repository-root `render.yaml` defines a Node web service rooted at `server`, installs from the lockfile, starts with `npm start`, and uses `/api/health` for its health check. Deploy it as a Render Blueprint, then enter the following in the service's environment settings:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Private Atlas connection string for the production database |
| `CLIENT_URL` | Exact frontend origin, e.g. `https://app.example.com` (no trailing slash) |
| `API_BASE_URL` | API origin, e.g. `https://api.example.com` (no `/api/v1` suffix) |
| `JWT_ACCESS_SECRET` | Generated by the Blueprint |
| `JWT_REFRESH_SECRET` | Generated by the Blueprint |

Do not set `PORT`; Render supplies it. Configure Atlas Network Access to the service's stable Render egress IPs where available, and avoid unrestricted public access. Keep secrets in Render's environment settings, not in `render.yaml` or source control. For reliable cross-origin cookie authentication, put the frontend and API on subdomains of the same custom domain. Configure SMTP and Cloudinary separately if email and hosted uploads are required.

---

## 🧪 Automated Testing

Run the Vitest unit & security test suite:
```bash
npm test
```

---

## 🐳 Docker Deployment

Build and run the non-root production container:
```bash
docker build -t taskflow-pro-api .
docker run -p 5000:5000 --env-file .env taskflow-pro-api
```

---

## 🔗 Integration Guide

For Axios interceptors, cookie refresh flows, and Socket.IO client setup, see [`docs/FRONTEND_INTEGRATION.md`](./docs/FRONTEND_INTEGRATION.md).
