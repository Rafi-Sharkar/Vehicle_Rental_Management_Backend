# Vehicle Rental Management Backend (VRM)

A production-grade REST API for a vehicle rental management system built with **Node.js, Express, TypeScript, Knex, and PostgreSQL 17 (Docker)** following Object-Oriented Design Principles (Controllers, Services, Repositories).

---

## 📚 Interactive Swagger Documentation
Access the interactive OpenAPI 3.0.0 documentation served live at:
👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

---

## 🌟 Key Features

1. **Environment & Setup**:
   - PostgreSQL 17 running in Docker (`docker-compose.yml`)
   - Knex query builder for migrations, seeds, and raw SQL report queries
   - Clean OOP structure (Controllers, Services, Repositories)
   - Input validation using **Joi** schemas
   - Comprehensive **ESLint + Prettier** configuration
   - Photo storage using **Multer** (`/uploads/vehicles`)

2. **Database Schema**:
   - `staff`: User authentication record (`id`, `email`, `password_hash`, `name`, `created_at`, `updated_at`)
   - `vehicles`: Fleet vehicles (`id`, `name`, `plate_number`, `category`, `daily_rate`, `photo_path`, `deleted_at`, `created_at`, `updated_at`)
   - `rentals`: Customer bookings (`id`, `vehicle_id`, `customer_name`, `customer_phone`, `start_date`, `end_date`, `total_amount`, `status`, `created_at`, `updated_at`)

3. **Authentication & Profile Management**:
   - `POST /auth/register` (email + password + name -> staff account creation & JWT)
   - `POST /auth/login` (email + password -> JWT token)
   - `GET /auth/profile` (Fetch current staff profile, JWT protected)
   - `PATCH /auth/profile` (Update current staff name, email, or password, JWT protected)
   - `DELETE /auth/profile` (Delete current staff profile and account, JWT protected)
   - Basic rate limiting on `/auth/login` (10 requests per 15 mins)
   - JWT middleware protecting `/vehicles`, `/rentals`, `/reports`, and `/auth/profile` routes

4. **Interactive Swagger Documentation**:
   - Interactive OpenAPI 3.0.0 documentation served at **`http://localhost:3000/docs`**
   - Clean, standardized response payload format (`{ success: boolean, message: string, data: ... }`) without excessive verbosity.

5. **Overlap & Double-Booking Prevention**:
   - Server-side validation during `POST /rentals` and `PUT /rentals/:id`
   - Active rental status filter: `status IN ('booked', 'ongoing', 'completed')`
   - Overlap formula: `start_1 <= end_2 AND end_1 >= start_2`
   - **Concurrency Control**: Database transaction with row-level locking (`FOR UPDATE`) to prevent race conditions when two users attempt to book the same vehicle for overlapping dates simultaneously. Returns HTTP `409 Conflict` on overlap.
   - **Pricing Calculation**: Server-side total calculation `daily_rate * number_of_days` (inclusive: same start/end date = 1 day).

6. **Monthly Activity & Proration Report**:
   - `GET /reports/rentals?month=YYYY-MM` (optional `&vehicle_id=`)
   - Calculates per-vehicle: `total_bookings`, `days_rented`, `revenue`.
   - **Date Proration**: Only counts days and revenue falling inside the requested month. For instance, a rental running July 29–Aug 3 contributes **3 days** ($150.00 for $50/day rate) to the August report, not 6.
   - Identifies the vehicle with the highest revenue that month.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Environment `.env` file configuration:
```ini
PORT=3000
NODE_ENV=development

# Database configuration (PostgreSQL 17 via Docker)
DB_HOST=localhost
DB_PORT=5433
DB_USER=vrm_user
DB_PASSWORD=vrm_password
DB_NAME=vrm_db
DB_POOL_MIN=2
DB_POOL_MAX=10

# Security & Auth
JWT_SECRET=vrm-development-secret-jwt-key-2026
JWT_EXPIRES_IN=24h

# File Upload Path
UPLOAD_PATH=./uploads

# SuperAdmin Demo Credentials (Used in db:seed)
SUPER_ADMIN_EMAIL=rafisharkar144@gmail.com
SUPER_ADMIN_PASSWORD=12345678
```

### 2. Start PostgreSQL 17 Database via Docker
```bash
docker compose up -d
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Migrations & Seed Data
```bash
npm run db:migrate
npm run db:seed
```

🔑 **Seeded Demo Accounts & Data (`npm run db:seed`)**:

1. **Staff Accounts**:
   - **SuperAdmin**: `rafisharkar144@gmail.com` / `12345678` *(Configured via `.env`)*
   - **Operations Manager**: `manager@vrm.com` / `Password123!`
   - **Fleet Agent**: `staff@vrm.com` / `Password123!`

2. **Vehicle Fleet (6 Vehicles)**:
   - `Toyota Camry 2024` (Sedan, `ABC-1234`, $50.00/day)
   - `Tesla Model 3` (Electric, `EV-9999`, $100.00/day)
   - `Ford Transit Commercial Van` (Van, `VAN-5555`, $120.00/day)
   - `BMW X5 Luxury SUV` (SUV, `SUV-7777`, $150.00/day)
   - `Mercedes-Benz S-Class` (Luxury, `LUX-1000`, $250.00/day)
   - `Hyundai Ioniq 5` (Electric, `EV-5050`, $90.00/day)

3. **Rental Bookings (5 Demo Bookings)**:
   - **Toyota Camry**: `2026-07-29` to `2026-08-03` *(Cross-month boundary rental: 3 days in July, 3 days in Aug)*
   - **Tesla Model 3**: `2026-08-05` to `2026-08-10` ($600.00)
   - **BMW X5 SUV**: `2026-08-12` to `2026-08-18` ($1050.00)
   - **Mercedes S-Class**: `2026-08-20` to `2026-08-25` ($1500.00)
   - **Hyundai Ioniq 5**: `2026-08-01` to `2026-08-04` ($360.00)

### 5. Run Development Server
```bash
npm run dev
```
- API Server: `http://localhost:3000`
- Swagger Documentation: **`http://localhost:3000/docs`**

---

## 🧪 Running Automated Integration Tests & Code Checks

```bash
# Run End-to-End Integration Tests (runs DB seeds & tests all API endpoints)
npm test

# Run ESLint check
npm run lint

# Format codebase with Prettier
npm run format

# Build production TypeScript bundle
npm run build
```

---

## 📖 API Endpoints Summary

### Auth & Profile Management
- `POST /auth/register` (Body: `{ email, password, name }`)
- `POST /auth/login` (Body: `{ email, password }`)
- `GET /auth/profile` (Protected by JWT)
- `PATCH /auth/profile` (Protected by JWT, Body: `{ name?, email?, password? }`)
- `DELETE /auth/profile` (Protected by JWT)

### Vehicles (Protected by JWT)
- `GET /vehicles` (Query params: `page`, `limit`, `category`, `name`)
- `GET /vehicles/:id`
- `POST /vehicles` (Multipart Form-Data: `name`, `plate_number`, `category`, `daily_rate`, `photo`)
- `PUT /vehicles/:id` (Multipart Form-Data: `name`, `plate_number`, `category`, `daily_rate`, `photo`)
- `DELETE /vehicles/:id` (Soft delete: sets `deleted_at = NOW()`)

### Rentals (Protected by JWT)
- `GET /rentals` (Query params: `page`, `limit`, `vehicle_id`, `status`, `start_date`, `end_date`)
- `GET /rentals/:id`
- `POST /rentals` (Body: `{ vehicle_id, customer_name, customer_phone, start_date, end_date }`) -> Returns `409 Conflict` on overlap.
- `PUT /rentals/:id` (Body: `{ vehicle_id, customer_name, customer_phone, start_date, end_date, status }`)
- `DELETE /rentals/:id`

### Reports (Protected by JWT)
- `GET /reports/rentals?month=YYYY-MM` (Optional: `&vehicle_id=`)

---

## 💡 Overlap & Monthly Report Logic Explanation

### 1. Overlap Check Query
Two active rentals conflict if:
`existing.start_date <= new.end_date AND existing.end_date >= new.start_date`
And `status IN ('booked', 'ongoing', 'completed')`.

To guarantee thread safety during concurrent booking requests, the application wraps the availability check and insertion inside a Knex transaction executing `.forUpdate()` row locks:
```typescript
await db.transaction(async (trx) => {
  const existingOverlap = await knex('rentals')
    .transacting(trx)
    .where('vehicle_id', vehicleId)
    .whereIn('status', ['booked', 'ongoing', 'completed'])
    .andWhere('start_date', '<=', endDate)
    .andWhere('end_date', '>=', startDate)
    .forUpdate()
    .first();

  if (existingOverlap) {
    throw new AppError('The vehicle is already booked for overlapping dates', 409);
  }
  // Create rental...
});
```

### 2. Monthly Report Proration SQL Query
To calculate prorated days and revenue falling strictly within a target month `YYYY-MM`:
```sql
SELECT
  vehicles.id,
  vehicles.name,
  vehicles.plate_number,
  vehicles.category,
  COUNT(DISTINCT rentals.id) AS total_bookings,
  COALESCE(
    SUM(
      CASE
        WHEN rentals.id IS NOT NULL AND rentals.status IN ('booked', 'ongoing', 'completed')
        THEN (LEAST(rentals.end_date, :month_end::date) - GREATEST(rentals.start_date, :month_start::date) + 1)
        ELSE 0
      END
    ), 0
  )::integer AS days_rented,
  COALESCE(
    SUM(
      CASE
        WHEN rentals.id IS NOT NULL AND rentals.status IN ('booked', 'ongoing', 'completed')
        THEN (LEAST(rentals.end_date, :month_end::date) - GREATEST(rentals.start_date, :month_start::date) + 1) * vehicles.daily_rate
        ELSE 0
      END
    ), 0
  )::numeric(10,2) AS revenue
FROM vehicles
LEFT JOIN rentals ON vehicles.id = rentals.vehicle_id
  AND rentals.status IN ('booked', 'ongoing', 'completed')
  AND rentals.start_date <= :month_end::date
  AND rentals.end_date >= :month_start::date
WHERE vehicles.deleted_at IS NULL
GROUP BY vehicles.id, vehicles.name, vehicles.plate_number, vehicles.category, vehicles.daily_rate
ORDER BY revenue DESC;
```
