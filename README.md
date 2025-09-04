# Welcome

# 🍽️ Technomart Canteen Management System

An intelligent canteen ordering system built for the CTU-MC Multipurpose Cooperative. This platform digitizes food ordering, payment processing, inventory tracking, and user analytics — optimized for speed, accessibility, and usability across devices.

---

## 🧰 Tech Stack

- ⚡ **Vite** — Lightning-fast development server and bundler
- ⚛️ **React** — Component-based UI framework
- ✨ **TypeScript** — Type-safe JavaScript for scalability
- 🎨 **Tailwind CSS** — Utility-first CSS framework
- 🧩 **shadcn/ui** — Accessible, headless UI components

---

## 📸 Screenshots

![Dashboard](dashboard.png)

---

## 🚀 Features

- ✅ Mobile-first design for ordering meals
- 💳 Supports cash, GCash, and other digital payments
- 📦 Inventory and supplier management
- 📈 Analytics dashboard for admins
- 🔐 Role-based access (Admin, Staff, Customer)
- 🛎️ Pre-ordering, order tracking, and real-time status updates

---

## 🛠️ Installation

```bash
# Clone the repo
git clone https://github.com/jsephandrade/technomart-canteen-management-system.git
cd technomart-canteen-management-system

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 🔧 Environment & Backend Integration

- Copy `.env.example` to `.env` and set values for your environment.
  - `VITE_API_BASE_URL` → keep `/api` in development to use the Vite proxy.
  - `VITE_DEV_PROXY_TARGET` → your backend URL in dev, e.g. `http://localhost:8000`.
  - `VITE_WS_URL` (optional) → WebSocket endpoint if using real-time features.
- Dev proxy: Vite is configured to forward `/api` requests to `VITE_DEV_PROXY_TARGET` to avoid CORS.
- Production: Set `VITE_API_BASE_URL` to your public API origin (e.g. `https://api.example.com`).
- The API client reads `VITE_API_BASE_URL` and falls back to `/api` if not set.

### 📐 Data Contracts with Zod
- Schemas live in `src/api/schemas/*` (User, Role, MenuItem, InventoryItem, Order, Payment, Feedback, Catering, Dashboard).
- Use `validate(schema, data)` to assert API responses/requests.
- DTO mappers live in `src/api/mappers/*` (e.g., `userApiToModel`, `userModelToCreatePayload`).
- Services should validate and normalize fields (e.g., role/status casing) before returning to UI.

### 🔒 Security & Compliance
- CSRF: If your backend uses cookie-based auth, enable credentials and set CSRF names in `.env`.
  - `VITE_SEND_CREDENTIALS=true`
  - `VITE_CSRF_COOKIE_NAME=csrftoken` and `VITE_CSRF_HEADER_NAME=X-CSRFToken` (or your backend values)
  - The API client auto-adds the CSRF header for unsafe methods (POST/PUT/PATCH/DELETE).
- CORS: In dev, requests go through Vite proxy (`/api` → `VITE_DEV_PROXY_TARGET`) to avoid CORS. In prod, ensure backend CORS allows your frontend origin and credentials if you use cookies.
- Input sanitization: This UI renders user-supplied text as plain text (React escapes it). Avoid injecting HTML; if needed, sanitize on the server.
- PII safety: The app avoids logging tokens or user PII. Do not add console logs that include auth tokens, emails, or personal data.

---

## ⚙️ Environment Setup

1) Copy the example env and adjust for your setup:

```
cp .env.example .env
```

2) Key variables (all are optional with sensible dev defaults):

- `VITE_API_BASE_URL` — Base URL used by the frontend to build API requests.
  - Dev: keep `/api` to use the Vite proxy.
  - Prod: set to your public API (e.g., `https://api.example.com`).
- `VITE_DEV_PROXY_TARGET` — Target backend for the dev proxy (e.g., `http://localhost:8000`).
- `VITE_WS_URL` — WebSocket endpoint for realtime (e.g., `ws://localhost:8000/ws`).
- `VITE_ENABLE_MOCKS` — `false` to use real APIs; `true` to use mock data.
- `VITE_SEND_CREDENTIALS` — `true` to include cookies on requests (cookie-based auth).
- `VITE_CSRF_COOKIE_NAME` / `VITE_CSRF_HEADER_NAME` — CSRF names for cookie-based auth.

3) Dev proxy (CORS-free local dev):

- The Vite proxy forwards requests from `/api/*` → `VITE_DEV_PROXY_TARGET`.
- Keep `VITE_API_BASE_URL=/api` in dev so the proxy is used.

4) Realtime:

- Set `VITE_WS_URL` (e.g., `ws://localhost:8000/ws`).
- The app will connect to:
  - Orders: `${VITE_WS_URL}/orders`
  - Notifications: `${VITE_WS_URL}/notifications`
  - It falls back to polling if the socket is down.

---

## 🚦 Smoke Test (5–10 minutes)

Prereqs: `npm install`, dev backend running at `VITE_DEV_PROXY_TARGET` or keep mocks enabled.

1) Start the app

```
npm run dev
```

Open http://localhost:8080

2) Login

- With mocks: use `admin@canteen.com` / `1234`.
- With real backend: use any valid credentials.

3) Dashboard

- You should see 4 stat cards and 2 charts.
- If backend is wired, values reflect API; otherwise mock values appear.

4) Users

- Navigate to Users.
- Try search: type a name or email; results update after ~350ms (debounced).
- Add User: click “Add User”, submit — see a toast, row appears.
- Edit: use row menu → Edit — change role or email — toast appears, list updates.
- Activate/Deactivate: toggle from row menu — status dot and text update; toast appears.
- Delete: row menu → Delete — row removed; destructive toast appears.
- Role Management: click “Configure” for any role, update fields, Save — toast and refresh.

5) Notifications (Realtime)

- If `VITE_WS_URL` is set, push a test message to the server-side WS:
  - Example JSON to broadcast: `{ "type": "notification", "data": { "id": "test-1", "title": "Test", "message": "Hello", "time": "now", "type": "info" } }`
- New notification should appear at the top. If WS is down, no errors, and the page remains usable (poll fallback active).

6) POS Order Queue (Realtime)

- If WS is connected, send an `order_queue_update` broadcast with an array of orders, or an `order_update` with a single order object containing `id` and new `status`.
- The queue updates without a refresh. If WS drops, polling resumes every 5s.

7) Menu Image Upload (multipart/form-data)

- If your UI exposes an image upload action, pick a file and submit.
- The client posts `FormData` to `/menu/items/:id/image` (no manual Content-Type header).
- With mocks, a fake URL is generated; with API, the server response is used.

8) Security checks

- If using cookies: set `VITE_SEND_CREDENTIALS=true` and confirm cookie-based sessions work.
- Ensure CSRF cookie/header names match your backend; unsafe methods should carry the CSRF header.
- Dev proxy avoids CORS; in prod, confirm backend CORS allows the frontend origin.

If any step fails and you want me to wire that module to your backend endpoints, tell me which endpoints and I’ll plug them in.
