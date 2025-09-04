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
