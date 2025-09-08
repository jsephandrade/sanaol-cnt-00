# TechnoMart Canteen Management System

A modern canteen ordering and operations dashboard for the CTU-MC Multipurpose Cooperative. It digitizes food ordering, payments, inventory, user management, and analytics - optimized for speed, accessibility, and responsiveness across devices.

---

## Tech Stack

- Vite + React (SWC) on port `8080`
- React 18 with JSX (JavaScript; TypeScript tooling available)
- Tailwind CSS + `tailwindcss-animate`
- shadcn/ui built on Radix primitives + `lucide-react`
- React Router 6, TanStack Query
- Zod for API contracts and validation
- Recharts, date-fns, embla carousel, Sonner toasts

---

## Screenshot

![Dashboard](dashboard.png)

---

## Features

- POS with walk-in/online orders, discounts, live queue updates
- Menu management: add/edit items, availability toggle, image uploads
- Inventory tracking: grid/table views, filters, recent activity
- Payments: methods, recent transactions, basic reports/exports
- Dashboard analytics: KPIs, sales over time, category chart, popular items
- Users and roles: RBAC, permissions, activity logs
- Employee scheduling and staff overview
- Catering events: menu selection and order tracking
- Customer feedback: collection, metrics, reply workflow
- Authentication (mock or real backend), social provider placeholders
- Notifications and realtime channels (orders, notifications)

---

## Quick Start

Prerequisites: Node.js 18+ and npm.

```bash
# Clone the repo
git clone <repo-url>
cd sanaol-cnt-00

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:8080

---

## Scripts

- `npm run dev` - start Vite dev server
- `npm run dev:force` - dev server with full rebuild
- `npm run build` - production build to `dist/`
- `npm run build:dev` - non-minified dev build
- `npm run preview` - preview built app locally
- `npm run lint` / `lint:fix` - ESLint (flat config)
- `npm run format` - Prettier over the repo
- `npm run clean:vite` - clear Vite cache

Optional: `npm run prepare` to enable Husky hooks if you add them.

---

## Environment & Backend Integration

Copy `.env.example` to `.env` and adjust for your setup:

- `VITE_API_BASE_URL` - base URL for API requests.
  - Dev: keep `/api` to use the Vite dev proxy.
  - Prod: set to your public API (e.g., `https://api.example.com`).
- `VITE_DEV_PROXY_TARGET` - backend origin the dev proxy forwards to (e.g., `http://localhost:8000`).
- `VITE_WS_URL` - WebSocket base (e.g., `ws://localhost:8000/ws`).
- `VITE_ENABLE_MOCKS` - `false` to prefer real APIs; services gracefully fall back to mocks on failure.
- `VITE_SEND_CREDENTIALS` - `true` to send cookies (cookie-based auth).
- `VITE_CSRF_COOKIE_NAME` / `VITE_CSRF_HEADER_NAME` - CSRF names when using cookies.

Dev proxy: requests to `/api/*` are forwarded to `VITE_DEV_PROXY_TARGET` (see `vite.config.ts`). In production, set `VITE_API_BASE_URL` to your API origin and ensure CORS is configured appropriately.

Realtime: set `VITE_WS_URL` and the app connects to:

- Orders: `${VITE_WS_URL}/orders` - expects `order_queue_update` and `order_update` events
- Notifications: `${VITE_WS_URL}/notifications`

If the socket is unavailable, UI gracefully degrades to polling or static state.

---

## API Contracts (Zod) & Usage

- Schemas in `src/api/schemas/*` (User, Role, MenuItem, InventoryItem, Order, Payment, Feedback, Catering, Dashboard)
- Use `validate(schema, data)` from `src/api/schemas/utils.js` to assert request/response shapes
- DTO mappers in `src/api/mappers/*` normalize API <-> UI models
- See `API_USAGE_GUIDE.md` for how to add new services/hooks and mock data

---

## Pages & Routes (high-level)

- `/` Dashboard
- `/pos` POS
- `/menu` Menu Management
- `/inventory` Inventory
- `/payments` Payments
- `/users` User Management; `/logs` Activity Logs
- `/sales` Sales Analytics; `/feedback` Customer Feedback
- `/catering` Catering; `/employees` Employee Schedule
- `/notifications` Notifications; `/settings` Settings; `/help` Help
- `/login`, `/signup`, `/forgot-password`, `/face-scan`, `/face-registration`

---

## Project Structure (brief)

- `src/api/` - `client.js`, `services/*`, `schemas/*`, `mockData.js`
- `src/components/` - feature modules and `ui/*` (shadcn components)
- `src/pages/` - route pages (lazy-loaded)
- `src/hooks/` - domain hooks (inventory, users, POS, etc.)
- `src/lib/` - helpers like `realtime.js`, `utils.js`
- `public/` - static assets

Path alias: `@` -> `./src` (see `vite.config.ts`).

---

## Smoke Test (5-10 minutes)

Prereqs: `npm install`; backend at `VITE_DEV_PROXY_TARGET` (or let services fall back to mocks).

1. Start the app: `npm run dev`, then open http://localhost:8080
2. Login
   - Mock: `admin@canteen.com` / `1234`
   - Real backend: any valid credentials
3. Dashboard: 4 stat cards + 2 charts (API-backed if reachable)
4. Users: search, add, edit, activate/deactivate, delete, manage roles
5. Notifications: post a test WS message; it appears at the top
6. POS queue: emit `order_queue_update`/`order_update`; list updates live
7. Menu image upload: POST `/menu/items/:id/image` (multipart/form-data)
8. Security: if using cookies, set `VITE_SEND_CREDENTIALS=true` and verify CSRF/CORS

---

## Build & Deploy

- `npm run build` -> outputs to `dist/`
- `npm run preview` to verify locally

Serve `dist/` behind your preferred web server or static host. Ensure production `VITE_API_BASE_URL` points to your API and CORS is configured.

---

## Troubleshooting

- Port in use: change `server.port` in `vite.config.ts`
- 401s with cookie auth: set `VITE_SEND_CREDENTIALS=true` and CSRF names to match your backend
- Mixed content (WS/HTTP): use matching protocols (e.g., `wss://` with `https://`)

---

If you want this wired to a specific backend, share the endpoints and auth scheme and I can align the services and schemas accordingly.
