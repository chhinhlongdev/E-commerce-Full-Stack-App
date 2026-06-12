# E-commerce Full Stack App

## Structure
```
apps/
  web/   → Next.js 14 (Storefront + Admin Panel)
  api/   → Express.js + MongoDB
```

## Quick Start

### 1. Backend
```bash
cd apps/api
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm install
npm run dev            # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev            # runs on http://localhost:3000
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Storefront |
| `/products` | All products with search & filter |
| `/products/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (requires login) |
| `/login` | Sign in |
| `/register` | Create account |
| `/admin` | Dashboard (admin only) |
| `/admin/products` | CRUD products (admin only) |
| `/admin/orders` | Manage orders (admin only) |

## Create Admin User
Manually set `role: "admin"` on a user in MongoDB, or add a seed script.
