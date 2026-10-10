# Kaivinai — AI-Driven Market Linkage and Smart Cataloging Platform for Marginalized Artisans

A full MERN stack marketplace. Artisans upload a photo and a title; AI writes the description, keywords and category in several Indian languages. Customers browse, search, and order directly from makers.

## Stack
- **MongoDB + Mongoose**, **Express** (REST API, JWT auth, Multer uploads)
- **React 18 + Vite**, React Router, Axios, Recharts
- **AI**: Anthropic Claude API (vision + multilingual). Works without a key using a simple template fallback.

## Features
| Requirement | Where |
|---|---|
| Registration and login (JWT, bcrypt) | `server/routes/auth.js`, `client/src/pages/Auth.jsx` |
| Separate artisan, customer, admin dashboards | `ArtisanDashboard.jsx`, `MyOrders.jsx`, `AdminDashboard.jsx` |
| Product upload with images (up to 5) | `routes/products.js`, `middleware/upload.js` |
| AI descriptions and keywords from photo + details | `services/ai.js`, `POST /api/products/ai/generate` |
| Multilingual descriptions (English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi) | AI service + language switcher on product page |
| Categorization (AI-suggested, editable) | `services/ai.js` |
| Search and filtering (text, category, price, sort, paging) | `Shop.jsx`, `GET /api/products` |
| Cart and order management | `CartContext.jsx`, `routes/orders.js` (stock check, per-item status, cancel) |
| Artisan profiles and portfolios | `Artisans.jsx`, `ArtisanProfile.jsx` |
| Admin dashboard (stats, block users, hide/delete products, all orders) | `routes/admin.js` |
| Sales analytics (revenue, units, daily trend, top products) | `routes/analytics.js`, Sales tab |

## Setup
Requirements: Node 18+ and MongoDB (local or Atlas).

```bash
# 1. install
npm run install:all

# 2. configure the server
cd server
cp .env.example .env      # edit MONGO_URI, JWT_SECRET, and ANTHROPIC_API_KEY (optional)
cd ..

# 3. create admin + demo artisan
npm run seed

# 4. run (two terminals)
npm run server            # API on http://localhost:5000
npm run client            # app on http://localhost:5173
```

Seeded logins:
- Admin: `admin@artisan.local` / `Admin@12345` (change in `.env` before seeding)
- Demo artisan: `meena@artisan.local` / `Artisan@123`
- Customers: register from the site.

## AI setup
Get a key at console.anthropic.com, put it in `server/.env` as `ANTHROPIC_API_KEY`. The model is set by `ANTHROPIC_MODEL`. The first uploaded photo is sent to the model for the description, then deleted from the server. Artisans always review and edit the draft before saving.

## API summary
```
POST /api/auth/register | /login        GET/PUT /api/auth/me
GET  /api/products?q&category&minPrice&maxPrice&sort&page
GET  /api/products/:id    POST/PUT/DELETE (artisan)    POST /api/products/ai/generate
POST /api/orders (customer)   GET /api/orders/mine    GET /api/orders/artisan
PUT  /api/orders/:id/items/:itemId/status | /cancel
GET  /api/artisans   GET /api/artisans/:id
GET  /api/analytics/artisan
GET  /api/admin/stats | /users | /products | /orders
```

## Production notes
- Set a strong `JWT_SECRET` and a real `CLIENT_URL`.
- Uploads are stored on local disk; for deployment use S3, Cloudinary or similar.
- Payment is cash on delivery. To add online payment, create a Razorpay/Stripe order in `POST /api/orders` and confirm it with a webhook.
- Add rate limiting (`express-rate-limit`) and `helmet` before going public.
- Build the client with `npm run build --prefix client` and serve `client/dist` from any static host (proxy `/api` and `/uploads` to the server).
