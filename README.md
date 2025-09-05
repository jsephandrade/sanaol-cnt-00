# Technomart Canteen Management System

An intelligent canteen ordering system built for the CTU-MC Multipurpose Cooperative. This platform digitizes food ordering, payment processing, inventory tracking, and user analytics — optimized for speed, accessibility, and usability across devices.

---

## Tech Stack

- Vite: fast dev server and bundler
- React: component-based UI
- TypeScript: scalable, type-safe development
- Tailwind CSS: utility-first styling
- shadcn/ui + Radix: accessible, composable UI primitives

---

## Screenshot

![Dashboard](dashboard.png)

---

## Features

- Mobile-first UI for ordering meals
- Multiple payments: cash, GCash, digital wallets
- Inventory and supplier management
- Admin analytics dashboard
- Role-based access (Admin, Staff, Customer)
- Pre-ordering, order tracking, realtime updates

---

## Installation

```bash
# Clone the repo
git clone https://github.com/jsephandrade/technomart-canteen-management-system.git
cd technomart-canteen-management-system

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:8080

---

## Environment & Backend Integration

- Copy `.env.example` to `.env` and set values for your environment.
  - `VITE_API_BASE_URL` — keep `/api` in development to use the Vite proxy.
  - `VITE_DEV_PROXY_TARGET` — your backend URL in dev, e.g. `http://localhost:8000`.
  - `VITE_WS_URL` (optional) — WebSocket endpoint for realtime features.
- Dev proxy: Vite forwards `/api` requests to `VITE_DEV_PROXY_TARGET` to avoid CORS.
- Production: Set `VITE_API_BASE_URL` to your public API origin (e.g. `https://api.example.com`).
- The API client reads `VITE_API_BASE_URL` and falls back to `/api` if not set.

### Data Contracts with Zod

- Schemas in `src/api/schemas/*` (User, Role, MenuItem, InventoryItem, Order, Payment, Feedback, Catering, Dashboard).
- Use `validate(schema, data)` to assert API responses/requests.
- DTO mappers in `src/api/mappers/*` (e.g., `userApiToModel`, `userModelToCreatePayload`).
- Services validate and normalize fields (e.g., role/status casing) before returning to UI.

### Security & Compliance

- CSRF: If your backend uses cookie-based auth, enable credentials and set CSRF names in `.env`.
  - `VITE_SEND_CREDENTIALS=true`
  - `VITE_CSRF_COOKIE_NAME=csrftoken` and `VITE_CSRF_HEADER_NAME=X-CSRFToken` (or your backend values)
  - The API client auto-adds the CSRF header for unsafe methods (POST/PUT/PATCH/DELETE).
- CORS: In dev, requests go through the Vite proxy. In prod, ensure backend CORS allows the frontend origin and credentials if you use cookies.
- Input sanitization: Renders user-supplied text as plain text (React escapes it). Avoid injecting HTML; if needed, sanitize on the server.
- PII safety: Avoid logging tokens or user PII.

---

## Environment Setup

1. Copy the example env and adjust for your setup:

```bash
cp .env.example .env
```

2. Key variables (optional with sensible dev defaults):

- `VITE_API_BASE_URL` — Base URL for API requests.
  - Dev: keep `/api` to use the Vite proxy.
  - Prod: set to your public API (e.g., `https://api.example.com`).
- `VITE_DEV_PROXY_TARGET` — Target backend for the dev proxy (e.g., `http://localhost:8000`).
- `VITE_WS_URL` — WebSocket endpoint for realtime (e.g., `ws://localhost:8000/ws`).
- `VITE_ENABLE_MOCKS` — `false` to use real APIs; `true` to use mock data.
- `VITE_SEND_CREDENTIALS` — `true` to include cookies on requests (cookie-based auth).
- `VITE_CSRF_COOKIE_NAME` / `VITE_CSRF_HEADER_NAME` — CSRF names for cookie-based auth.

3. Realtime:

- Set `VITE_WS_URL` (e.g., `ws://localhost:8000/ws`).
- App connects to:
  - Orders: `${VITE_WS_URL}/orders`
  - Notifications: `${VITE_WS_URL}/notifications`
  - Falls back to polling if the socket is down.

---

## Smoke Test (5–10 minutes)

Prereqs: `npm install`, dev backend running at `VITE_DEV_PROXY_TARGET` or keep mocks enabled.

1. Start the app: `npm run dev` → http://localhost:8080

2. Login
   - Mocks: `admin@canteen.com` / `1234`
   - Real backend: any valid credentials

3. Dashboard
   - See 4 stat cards and 2 charts.
   - Wired to API = real values; otherwise mock values.

4. Users
   - Search, Add, Edit, Activate/Deactivate, Delete, and manage Roles.

5. Notifications (Realtime)
   - Broadcast a test message on the server WS; it appears at the top.

6. POS Order Queue (Realtime)
   - Send `order_queue_update` or `order_update` events; UI updates live.

7. Menu Image Upload
   - Submit multipart/form-data to `/menu/items/:id/image`.

8. Security checks
   - If using cookies: set `VITE_SEND_CREDENTIALS=true` and confirm sessions.
   - Ensure CSRF names match your backend; confirm CORS in prod.

If any step fails and you want this wired to your backend endpoints, tell me which endpoints and I’ll plug them in.
