# TaskFlow Pro — Frontend Integration Guide

This guide details how to integrate the frontend (`client/`) with the TaskFlow Pro REST API and Socket.IO backend (`server/`).

---

## 1. API Base URL & Credentials Configuration

In your frontend `.env`:
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

Axios configuration (`client/src/services/api.ts`):
```ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Mandatory for HttpOnly rotating refresh-token cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach access token & organization context
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_access_token');
  const orgId = localStorage.getItem('tf_active_org_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (orgId) {
    config.headers['x-organization-id'] = orgId;
  }
  return config;
});

// Automatic token refresh interceptor on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('tf_access_token', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('tf_access_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 2. Authentication Flow

### Register
`POST /auth/register`
```json
{
  "firstName": "First",
  "lastName": "Last",
  "email": "user@example.com",
  "password": "your-password",
  "jobTitle": "Job title",
  "department": "Department"
}
```

### Login
`POST /auth/login`
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "674...",
      "firstName": "First",
      "lastName": "Last",
      "email": "user@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOi...",
    "organizations": [
      {
        "id": "674...",
        "name": "Organization name",
        "slug": "organization-slug",
        "role": "admin"
      }
    ]
  }
}
```
*Note: A secure HttpOnly cookie `refreshToken` is automatically stored by the browser.*

---

## 3. Multi-Tenant Organization Scoping

All project, task, Kanban, chat, file, and report endpoints are scoped under:
```
/organizations/:organizationId/...
```
Example:
- Get projects: `GET /organizations/:organizationId/projects`
- Create task: `POST /organizations/:organizationId/tasks`
- Kanban board: `GET /organizations/:organizationId/projects/:projectId/board`
- Move task: `PATCH /organizations/:organizationId/tasks/:taskId/move`

---

## 4. Real-time Collaboration via Socket.IO

Connect to backend Socket.IO:
```ts
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('tf_access_token'),
  },
  withCredentials: true,
});

// Join Active Organization
socket.emit('org:join', { organizationId: '674...' });

// Join Chat Conversation
socket.emit('conversation:join', { conversationId: '674...' });

// Listen for new messages (text & voice)
socket.on('message:new', (message) => {
  console.log('Incoming message or voice note:', message);
});

// Listen for live Kanban task moves
socket.on('task:moved', (data) => {
  console.log('Task moved by peer:', data);
});
```

---

## 5. Workspace Setup

Register a user and create an organization through the onboarding flow. New organizations contain no sample projects, tasks, conversations, or members beyond the owner.
