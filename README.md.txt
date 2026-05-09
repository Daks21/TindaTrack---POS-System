================================================================
  TindaTrack v0.1
  SARI-SARI STORE POS + INVENTORY + SALES MANAGEMENT SYSTEM
================================================================

================================================================
[1. PROJECT TITLE & OVERVIEW]
================================================================

  PROJECT NAME  : TindaTrack

  TAGLINE       : A simple, powerful POS and inventory system
                  built for Filipino sari-sari stores and MSMEs.

  PURPOSE       :
    - Help small business owners manage products and stock
    - Record and track sales quickly (POS-style)
    - Generate receipts and view sales history
    - Provide a dashboard for business insights
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
  All code lives in ONE root folder: sari-sari-pos/

  ROOT FOLDER LAYOUT:
  ─────────────────────────────────────────────────────────────
  sari-sari-pos/
  │
  ├── frontend/                ← Everything the user sees
  ├── backend/                 ← Server, routes, logic
  ├── database/                ← SQL schema and seed data
  ├── ai/                      ← AI assistant (Phase 4)
  │
  ├── .env                     ← Secret config (API keys, DB URL)
  ├── .gitignore               ← Files to exclude from Git
  ├── package.json             ← Project dependencies and scripts
  └── README.md                ← Project summary for teammates
  ─────────────────────────────────────────────────────────────

  DETAILED BREAKDOWN:
  ─────────────────────────────────────────────────────────────

  frontend/
  │
  │  PURPOSE: All HTML, CSS, and JavaScript for the user interface.
  │           Each page has its own HTML file.
  │           CSS and JS files are organized by function.
  │
  ├── index.html               ← Login / Landing page (entry point)
  │
  ├── pages/                   ← One file per screen/feature
  │   ├── dashboard.html       ← Overview: daily sales, charts
  │   ├── products.html        ← Add/edit/delete products
  │   ├── inventory.html       ← Track stock levels
  │   ├── sales.html           ← POS screen (input sales)
  │   ├── history.html         ← View past sales and receipts
  │   └── register.html        ← New user registration page
  │
  ├── css/
  │   ├── main.css             ← Global styles (fonts, colors, layout)
  │   ├── components.css       ← Buttons, cards, modals, tables
  │   └── responsive.css       ← Mobile-friendly adjustments
  │
  ├── js/
  │   ├── auth.js              ← Login and register logic
  │   ├── products.js          ← Add/edit/delete product behavior
  │   ├── inventory.js         ← Stock update logic
  │   ├── sales.js             ← POS cart, checkout, receipt
  │   ├── history.js           ← Filter and display sales logs
  │   ├── dashboard.js         ← Charts and statistics
  │   └── api.js               ← Central file to call backend APIs
  │
  └── assets/
      ├── images/              ← Logos, product placeholder images
      ├── icons/               ← UI icons (SVG or PNG)
      └── fonts/               ← Custom fonts if needed

  ─────────────────────────────────────────────────────────────

  backend/
  │
  │  PURPOSE: The server that handles all logic.
  │           Receives requests from frontend,
  │           processes them, and talks to the database.
  │
  ├── server.js                ← App entry point. Starts the server.
  │
  ├── routes/                  ← Defines URL endpoints (API paths)
  │   ├── auth.routes.js       ← /api/auth/login, /api/auth/register
  │   ├── products.routes.js   ← /api/products (CRUD)
  │   ├── sales.routes.js      ← /api/sales (create, history)
  │   └── inventory.routes.js  ← /api/inventory (stock updates)
  │
  ├── controllers/             ← Logic for each feature
  │   ├── auth.controller.js   ← Check credentials, create session
  │   ├── products.controller.js  ← Add/edit/delete product logic
  │   ├── sales.controller.js  ← Process sales, generate receipts
  │   └── inventory.controller.js ← Update and check stock levels
  │
  ├── models/                  ← Database table definitions
  │   ├── user.model.js        ← User table structure
  │   ├── product.model.js     ← Product table structure
  │   ├── sale.model.js        ← Sale table structure
  │   └── inventory.model.js   ← Inventory/stock table structure
  │
  └── middleware/              ← Code that runs between request/response
      ├── auth.middleware.js   ← Checks if user is logged in
      └── error.middleware.js  ← Catches and formats errors

  ─────────────────────────────────────────────────────────────

  database/
  │
  │  PURPOSE: SQL files to create and populate the database.
  │           You run these once to set up your data structure.
  │
  ├── schema.sql               ← CREATE TABLE statements
  └── seed.sql                 ← Sample data for testing

  ─────────────────────────────────────────────────────────────

  ai/
  │
  │  PURPOSE: AI assistant integration (Phase 4).
  │           Fetches data from backend, sends to Claude API,
  │           returns insights to the user.
  │
  └── assistant.js             ← Claude API integration logic

  ─────────────────────────────────────────────────────────────

  ROOT-LEVEL FILES:
  ─────────────────────────────────────────────────────────────

  README.md 
    INCLUDE: setup steps, tech stack, how to run

================================================================
[4. DEVELOPMENT ROADMAP]
================================================================

    Frontend → Backend → Database → AI → Deployment

  ──────────────────────────────────────────────────────────────
  PHASE 1: FRONTEND (HTML + CSS + JavaScript)
  ──────────────────────────────────────────────────────────────

  MODULES:
    Module 1.1 — Login & Register Pages
    Module 1.2 — Dashboard Page
    Module 1.3 — Product Management Page
    Module 1.4 — POS / Sales Interface
    Module 1.5 — Sales History Page
    Module 1.6 — Receipt Generation

  ──────────────────────────────────────────────────────────────
  PHASE 2: BACKEND (Node.js + Express)
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
  END OF CURRENT DOCUMENT — Version 0.1
================================================================