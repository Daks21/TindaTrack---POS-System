================================================================
  Celso POS v1.0
  SARI-SARI STORE POS + INVENTORY + SALES MANAGEMENT SYSTEM
================================================================

================================================================
[1. PROJECT TITLE & OVERVIEW]
================================================================

  PROJECT NAME  : Celso POS

  TAGLINE       : A simple, powerful POS and inventory system
                  built for Filipino sari-sari stores and MSMEs.

  PURPOSE       :
    - Help small business owners manage products and stock
    - Record and track sales quickly (POS-style)
    - Generate receipts and view sales history
    - Provide a dashboard and analytics for business insights
    - Eventually: AI assistant for smart recommendations

  TARGET USERS  :
    - Sari-sari store owners
    - Small retail shop owners
    - MSMEs with no technical background
    - Anyone needing a simple POS without expensive software

  WHAT MAKES IT DIFFERENT:
    - Built specifically for Filipino MSME needs
    - Simple UI, no overwhelming features
    - Scales from basic to AI-powered over time
    - Open and learnable — built step by step

================================================================
[2. SYSTEM ARCHITECTURE]
================================================================

  OVERVIEW:
    The system is divided into 4 layers.
    Each layer has a specific job and communicates
    only with the layers next to it.

  ┌─────────────────────────────────────────────┐
  │           LAYER 1: FRONTEND                 │
  │   What the user sees and interacts with     │
  │   Tech: HTML → CSS → JS → React (later)    │
  └─────────────────────┬───────────────────────┘
                        │  HTTP Requests (fetch/axios)
                        ▼
  ┌─────────────────────────────────────────────┐
  │           LAYER 2: BACKEND                  │
  │   Processes requests, applies rules/logic   │
  │   Tech: Node.js + Express                   │
  └────────────┬──────────────────┬─────────────┘
               │                  │
               ▼                  ▼
  ┌────────────────────┐  ┌───────────────────────┐
  │  LAYER 3: DATABASE │  │  LAYER 4: AI (FUTURE) │
  │  Stores all data   │  │  Reads data, gives    │
  │  permanently       │  │  smart suggestions    │
  │  Tech: SQL         │  │  Tech: Claude API     │
  └────────────────────┘  └───────────────────────┘

  HOW THEY CONNECT:
    1. User opens browser → sees FRONTEND
    2. User clicks "Add Sale" → FRONTEND sends request to BACKEND
    3. BACKEND validates the request and writes to DATABASE
    4. DATABASE confirms → BACKEND responds to FRONTEND
    5. FRONTEND updates what the user sees
    6. (Future) BACKEND fetches data → sends to AI → returns insight

  ANALOGY:
    Think of it like a restaurant:
    - Frontend   = Dining area (what customers see)
    - Backend    = Kitchen (where the cooking/logic happens)
    - Database   = Storage/pantry (where ingredients are kept)
    - AI Layer   = Head chef advisor (reads everything, gives tips)

  COMMUNICATION FORMAT:
    - Frontend ↔ Backend : JSON over HTTP (REST API)
    - Backend  ↔ Database: SQL queries
    - Backend  ↔ AI      : API calls with structured data

================================================================
[3. PROJECT STRUCTURE]
================================================================

  STRATEGY: Frontend First, then Backend, then Database, then AI.
  All code lives in ONE root folder: Celso_POS/

  ROOT FOLDER LAYOUT:
  ─────────────────────────────────────────────────────────────
  Celso_POS/
  │
  ├── frontend/                ← Everything the user sees
  ├── backend/                 ← Server, routes, logic (Phase 2)
  ├── database/                ← SQL schema and seed data (Phase 3)
  ├── ai/                      ← AI assistant (Phase 4)
  │
  ├── .gitignore               ← Files to exclude from Git
  └── README.md                ← This file
  ─────────────────────────────────────────────────────────────

  DETAILED BREAKDOWN:
  ─────────────────────────────────────────────────────────────

  frontend/
  │
  │  PURPOSE: All HTML, CSS, and JavaScript for the user interface.
  │           Each page has its own HTML file.
  │           CSS is split by responsibility; JS by feature.
  │
  ├── index.html               ← Login page (app entry point)
  │
  ├── pages/                   ← One file per screen/feature
  │   ├── auth/
  │   │   └── register.html    ← New user registration
  │   ├── dashboard.html       ← Overview: stats, charts, heatmap
  │   ├── products.html        ← Add/edit/delete products (CRUD)
  │   ├── inventory.html       ← Stock levels, restock modal
  │   ├── order.html           ← POS screen — cart + checkout
  │   ├── history.html         ← Past sales with filters + receipt
  │   ├── analytics.html       ← Charts, KPIs, activity heatmap
  │   ├── sales.html           ← Sales reports page (placeholder)
  │   └── account.html         ← User profile + app settings
  │
  ├── css/
  │   ├── main.css             ← Variables, reset, typography,
  │   │                           animations, login/register styles
  │   ├── layout.css           ← App shell: sidebar, topbar,
  │   │                           notification panel, page body
  │   ├── components.css       ← Shared components: tables, badges,
  │   │                           buttons, inputs, modals, receipt
  │   └── pages/               ← Page-specific styles (one per page)
  │       ├── dashboard.css
  │       ├── products.css
  │       ├── inventory.css
  │       ├── order.css
  │       ├── history.css
  │       ├── analytics.css
  │       └── account.css
  │
  ├── js/
  │   │
  │   ├── core/                ← App-wide infrastructure
  │   │   ├── auth.js          ← Login, register, checkAuth guard
  │   │   ├── theme.js         ← Dark/light mode toggle
  │   │   ├── data.js          ← Shared utilities (formatPeso),
  │   │   │                       stock colors, localStorage seeding
  │   │   └── api.js           ← HTTP/fetch helpers (Phase 2+)
  │   │
  │   ├── components/          ← Reusable UI pieces (not page-specific)
  │   │   ├── sidebar.js       ← Active nav link, user initials
  │   │   ├── notifications.js ← Stock-based notification panel
  │   │   └── receipt.js       ← Shared receipt modal logic
  │   │
  │   └── pages/               ← One script per page
  │       ├── dashboard.js     ← Summary stats, charts, heatmap
  │       ├── products.js      ← Product CRUD, modal, search
  │       ├── inventory.js     ← Stock table, filters, restock
  │       ├── order.js         ← POS cart, category pills, checkout
  │       ├── history.js       ← Sales filter, detail modal
  │       ├── analytics.js     ← KPI cards, Chart.js charts, date range
  │       ├── sales.js         ← Sales reports page (auth guard only)
  │       └── account.js       ← Account dropdown, settings, tax rate
  │
  └── assets/
      ├── images/              ← Logos, product placeholder images
      ├── icons/               ← UI icons (SVG or PNG)
      └── fonts/               ← Custom fonts if needed

  ─────────────────────────────────────────────────────────────

  CSS LOADING PATTERN (all app pages):
  ─────────────────────────────────────────────────────────────

    <link rel="stylesheet" href="../css/main.css">
    <link rel="stylesheet" href="../css/layout.css">
    <link rel="stylesheet" href="../css/components.css">
    <link rel="stylesheet" href="../css/pages/[page].css">

  Login (index.html) and Register (pages/auth/register.html) only
  need main.css — no sidebar or layout styles.

  ─────────────────────────────────────────────────────────────

  JS LOADING ORDER (all app pages):
  ─────────────────────────────────────────────────────────────

    components/sidebar.js → core/theme.js → core/auth.js →
    core/data.js → components/notifications.js →
    [components/receipt.js if needed] → pages/[page].js

  Core and component scripts always load before page scripts so
  that functions like formatPeso and checkAuth are available
  globally.

  ─────────────────────────────────────────────────────────────

  backend/                     ← Phase 2 (not yet built)
  │
  ├── server.js                ← App entry point. Starts the server.
  ├── routes/                  ← URL endpoints (API paths)
  │   ├── auth.routes.js       ← /api/auth/login, /api/auth/register
  │   ├── products.routes.js   ← /api/products (CRUD)
  │   ├── sales.routes.js      ← /api/sales (create, history)
  │   └── inventory.routes.js  ← /api/inventory (stock updates)
  │
  ├── controllers/             ← Logic for each feature
  │   ├── auth.controller.js
  │   ├── products.controller.js
  │   ├── sales.controller.js
  │   └── inventory.controller.js
  │
  ├── models/                  ← Database table definitions
  │   ├── user.model.js
  │   ├── product.model.js
  │   ├── sale.model.js
  │   └── inventory.model.js
  │
  └── middleware/
      ├── auth.middleware.js   ← Checks if user is logged in
      └── error.middleware.js  ← Catches and formats errors

  ─────────────────────────────────────────────────────────────

  database/                    ← Phase 3 (not yet built)
  │
  ├── schema.sql               ← CREATE TABLE statements
  └── seed.sql                 ← Sample data for testing

  ─────────────────────────────────────────────────────────────

  ai/                          ← Phase 4 (not yet built)
  │
  └── assistant.js             ← Claude API integration logic

  ─────────────────────────────────────────────────────────────

================================================================
[4. DEVELOPMENT ROADMAP]
================================================================

    Frontend → Backend → Database → AI → Deployment

  ──────────────────────────────────────────────────────────────
  PHASE 1: FRONTEND (HTML + CSS + JavaScript)       [COMPLETE]
  ──────────────────────────────────────────────────────────────

  All data is stored in localStorage during this phase.
  No backend or database is connected yet.

  MODULES BUILT:

    Module 1.1 — Login Page
      - Login form with validation
      - localStorage-based auth session
      - Redirect guard (checkAuth) used on all protected pages

    Module 1.2 — Register Page
      - Registration form
      - Stores user account in localStorage
      - Links back to login

    Module 1.3 — Dashboard Page
      - Summary cards: revenue, orders, products, low stock count
      - Recent sales table
      - Sidebar navigation with active state
      - Topbar with notification bell + theme toggle

    Module 1.4 — Product Management Page
      - Full CRUD: add, edit, delete products
      - Search and category filter
      - Stock color coding (ok / low / out)
      - Summary stats row

    Module 1.5 — Inventory Page
      - Inventory table with status filters
      - Per-product restock modal
      - Stock status summary (total, ok, low, out)

    Module 1.6 — POS / Sales Interface (order.html)
      - Two-panel layout: product grid + cart
      - Category pill filters (collapses to dropdown on mobile)
      - Cart with quantity controls, tax toggle
      - Payment input with live change calculation
      - Stock deduction on checkout

    Module 1.7 — Sales History Page
      - Filter by date range and payment method
      - Search by product or receipt number
      - Sale detail modal with full breakdown
      - Receipt reprint from history

    Module 1.8 — Receipt Generation
      - Shared receipt modal (used on POS and History)
      - Receipt number, date, cashier, itemized table
      - Subtotal, tax, total, payment, change
      - Browser print support

    Module 1.9 — Account Settings & Dropdown
      - Sidebar user card with popup dropdown
      - Account settings page: profile info, theme toggle,
        tax rate selector, customizable stock status colors
      - Settings persist to localStorage

    Module 1.10 — Sales Reports Page (Scaffolded)
      - sales.html placeholder page with full app shell
      - "Coming soon" UI for future financial reports/analysis
      - Auth guard applied (checkAuth); ready for Phase 2+ data

  CROSS-CUTTING FEATURES (built across modules):

    Dark / Light Theme
      - Instant toggle via topbar button or account settings
      - Persists across sessions (localStorage)
      - Applied before page paint to prevent flash

    Notifications System
      - Bell icon in topbar with unread badge count
      - Auto-generates alerts from live stock levels
      - Low stock and out-of-stock notifications
      - Dismissable individually or all at once

    Analytics Page
      - Date range presets: Today, This Week, This Month, etc.
      - Custom date range picker
      - KPI cards: revenue, orders, avg order value, units sold
      - Revenue trend chart, top products, category breakdown
      - Sales activity heatmap (GitHub-style)
      - Pinnable charts to dashboard via toggle

    Dashboard Analytics Section
      - Mini charts pinned from Analytics page
      - Compact heatmap
      - Link to full Analytics page

    Shared Utilities (data.js)
      - formatPeso() — centralized PHP currency formatting
      - Stock color theming via CSS variables
      - Customizable stock thresholds
      - localStorage seed data for demo/development

  ──────────────────────────────────────────────────────────────
  PHASE 2: BACKEND (Node.js + Express)              [NEXT]
  ──────────────────────────────────────────────────────────────

  MODULES:
    Module 2.1 — Express Server Setup
    Module 2.2 — Auth API (Login / Register)
    Module 2.3 — Products API (CRUD)
    Module 2.4 — Sales API (Create + History)
    Module 2.5 — Inventory API (Stock Updates)
    Module 2.6 — Connect Frontend to Backend (fetch + async/await)

  ──────────────────────────────────────────────────────────────
  PHASE 3: DATABASE (SQL)
  ──────────────────────────────────────────────────────────────

  MODULES:
    Module 3.1 — Design Database Schema (entity breakdown)
    Module 3.2 — Create Tables (users, products, sales)
    Module 3.3 — Connect Backend to Database
    Module 3.4 — Run SQL through the API
    Module 3.5 — Seed sample data for testing

  ──────────────────────────────────────────────────────────────
  PHASE 4: AI INTEGRATION
  ──────────────────────────────────────────────────────────────

  MODULES:
    Module 4.1 — Connect to Claude API
    Module 4.2 — Fetch and format database data as AI input
    Module 4.3 — Build a chat-style UI for the assistant
    Module 4.4 — Test and refine prompts

  ──────────────────────────────────────────────────────────────
  PHASE 5: DEPLOYMENT
  ──────────────────────────────────────────────────────────────

  MODULES:
    Module 5.1 — Deploy Frontend (Vercel or Netlify)
    Module 5.2 — Deploy Backend (Railway or Render)
    Module 5.3 — Deploy Database (Supabase or PlanetScale)
    Module 5.4 — Set environment variables in production
    Module 5.5 — Final testing and go-live

================================================================
  END OF DOCUMENT — Version 1.1 (Phase 1 Complete)
================================================================
