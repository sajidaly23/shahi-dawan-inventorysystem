# SHAHI-DAWAN ERP — Next.js Migration Complete

## Architecture

Migrated from Vite + React SPA to Next.js 16 (App Router) full-stack ERP.

## Tech Stack

- Framework: Next.js 16.4.2 (App Router, Turbopack)
- Frontend: React 19 + TypeScript + Tailwind CSS v4
- Auth: jose (JWT) + bcryptjs + HTTP-only cookies
- Database: MongoDB via Mongoose (with seed-data fallback)
- Validation: Zod v4

## Quick Start

1. npm install
2. cp .env.example .env.local  (edit MONGODB_URI and SESSION_SECRET)
3. npm run dev  -> http://localhost:3000

## Demo Login Credentials

- Admin: admin@shahidiwan.com / any password
- Manager: manager@shahidiwan.com / any password
- Inventory: inventory@shahidiwan.com / any password
- Cashier: cashier@shahidiwan.com / any password
- Chef: chef@shahidiwan.com / any password
- Reception: reception@shahidiwan.com / any password

Note: MongoDB is optional. When offline or empty, any seed user logs in with any password.

## Routes

### Public
- / - Landing page
- /about - About
- /contact - Contact

### Auth
- /login - Staff login
- /register - Staff registration

### Dashboard (Protected)
- /dashboard - Executive Operations Center
- /dashboard/raw-materials - Raw Materials and Stock
- /dashboard/stock-in - Stock In / Purchases
- /dashboard/stock-out - Waste Management
- /dashboard/stock-ledger - Stock Ledger Trail
- /dashboard/recipes - Recipe / BOM Engine
- /dashboard/menu - Menu Items and Pricing
- /dashboard/pos - POS Order Terminal
- /dashboard/kitchen - Kitchen Display (KDS)
- /dashboard/tables - Floor Plan and Tables
- /dashboard/hotel - Room Matrix and PMS
- /dashboard/folio-billing - Hotel + Dining Folios
- /dashboard/guests - Guest Directory CRM
- /dashboard/suppliers - Suppliers Directory
- /dashboard/reports - Analytics and Financials
- /dashboard/audit-logs - Audit and Compliance
- /dashboard/settings - System Parameters

### API Endpoints
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET  /api/auth/session
- GET/POST /api/inventory
- POST /api/stock-in
- POST /api/stock-out
- GET/POST /api/recipes
- GET/POST /api/orders
- PATCH /api/orders/[id]
- GET  /api/reports/summary
- GET  /api/users

## Key Business Logic

- Recipe BOM Auto-Deduction when orders are marked completed
- Duplicate Deduction Prevention via inventoryDeducted flag
- Unit Conversion Engine: KG/Gram/ML/Liter/Piece
- Food Cost Percentage per recipe
- Low Stock Alerts with status transitions
- Stock Ledger full audit trail
- Hotel PMS: Reservation to Check-In to Check-Out to Folio
