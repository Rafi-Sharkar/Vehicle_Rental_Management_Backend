# 📋 Vehicle Rental Management Backend — Requirements & Task Checklist

## Objective
Build a REST API for a vehicle rental company. Staff log in and manage the vehicle fleet; customer bookings are recorded as rentals. A vehicle can't be booked twice for overlapping dates. Provide a monthly report of rental activity per vehicle.

---

## 1. Environment Setup
- [x] **Node.js + TypeScript project, OOP structure**: Modular architecture with Controllers, Services, and Repositories (`src/modules/*`).
- [x] **Express as the web framework**: App entrypoints initialized in `src/app.ts` & `src/server.ts`.
- [x] **Knex as the query builder**: Query builder configured in `knexfile.ts` & `src/config/knexConfig.ts`.
- [x] **PostgreSQL 17 (Docker)**: Real SQL database running in Docker container (`docker-compose.yml`, `postgres:17-alpine` on port `5433`).
- [x] **Joi for input validation**: Request validation schemas in `src/modules/*/*.schema.ts` and middleware in `src/middlewares/validate.middleware.ts`.
- [x] **ESLint + Prettier configured**: Code formatting and linting configured (`.eslintrc.js` & `.prettierrc`).
- [x] **.env for DB credentials, JWT secret, upload path, and port**: `.env` gitignored, with committed `.env.example`.
- [x] **Multer for local photo storage**: Photo upload middleware in `src/middlewares/upload.middleware.ts` storing files in `./uploads/vehicles/`.

---

## 2. Database Schema
- [x] **`staff` table**: `id` (PK, auto-increment), `email` (unique, required), `password_hash` (required), `name` (required), `created_at`, `updated_at` ([20260812000001_create_staff_table.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/database/migrations/20260812000001_create_staff_table.ts)).
- [x] **`vehicles` table**: `id` (PK, auto-increment), `name` (required), `plate_number` (unique, required), `category` (required), `daily_rate` (decimal, required), `photo_path` (optional), `deleted_at` (nullable), `created_at`, `updated_at` ([20260812000002_create_vehicles_table.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/database/migrations/20260812000002_create_vehicles_table.ts)).
- [x] **`rentals` table**: `id` (PK, auto-increment), `vehicle_id` (FK → vehicles.id, required), `customer_name` (required), `customer_phone` (required), `start_date` (date, required), `end_date` (date, required), `total_amount` (decimal, required), `status` (booked / ongoing / completed / cancelled — default booked), `created_at`, `updated_at` ([20260812000003_create_rentals_table.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/database/migrations/20260812000003_create_rentals_table.ts)).
- [x] **Application-level overlap check on create and update**: Overlap check implemented in `RentalService` ([rental.service.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/modules/rentals/rental.service.ts)).

---

## 3. Authentication
- [x] **`POST /auth/login` — email + password → JWT**: Authenticates staff credentials via `bcryptjs` and returns signed JWT token.
- [x] **JWT middleware protects every `/vehicles`, `/rentals`, and `/reports` route**: Auth middleware implemented in `src/middlewares/auth.middleware.ts`.
- [x] **Profile & Registration extensions**: `POST /auth/register`, `GET /auth/profile`, `PATCH /auth/profile`, `DELETE /auth/profile`.

---

## 4. Endpoints

### Auth
- [x] **`POST /auth/login`**: Authenticates staff and returns JWT token.

### Vehicles
- [x] **`GET /vehicles` — pagination, filter by category, search by name**: Implemented with pagination (`page`, `limit`), `category` filter, and `name` search (`VehicleRepository.findAll`).
- [x] **`GET /vehicles/:id`**: Returns vehicle details by ID.
- [x] **`POST /vehicles` — multipart form-data with photo**: Uploads photo using Multer and creates vehicle record.
- [x] **`PUT /vehicles/:id` — including photo replacement**: Updates vehicle details and cleans up replaced photo file.
- [x] **`DELETE /vehicles/:id` — soft delete**: Sets `deleted_at = NOW()`.

### Rentals
- [x] **`GET /rentals` — filter by vehicle_id, status, and date range**: Filters active rentals with date bounds, search by customer name/phone (`search`), and pagination (`RentalRepository.findAll`).
- [x] **`GET /rentals/:id`**: Returns rental details by ID.
- [x] **`POST /rentals` — body: vehicle_id, customer_name, customer_phone, start_date, end_date**:
  - [x] **409 if the vehicle already has an active rental overlapping these dates**: Returns HTTP 409 Conflict.
  - [x] **total_amount calculated server-side — daily_rate × number of days (same start/end date counts as 1 day)**: Calculated server-side using inclusive date formula.
- [x] **`PUT /rentals/:id` — date changes re-trigger the overlap check**: Re-evaluates date overlaps excluding current rental ID.
- [x] **`DELETE /rentals/:id`**: Deletes or cancels rental record.

### Reports
- [x] **`GET /reports/rentals?month=YYYY-MM` — optional &vehicle_id=**:
  - [x] **Per vehicle — id, name, total_bookings, days_rented, revenue**: Raw SQL aggregation per vehicle ([ReportRepository.getMonthlyRentalReport](file:///d:/Rafi_Sharkar/Project/vrm/src/modules/reports/report.repository.ts)).
  - [x] **Only count days/revenue that fall inside requested month**: PostgreSQL `GREATEST` and `LEAST` proration math (e.g. July 29–Aug 3 contributes 3 days to August report).
  - [x] **Return vehicle with highest revenue that month**: Identifies and returns `highest_revenue_vehicle`.

---

## 5. TypeScript
- [x] **Type every request body, response, and handler return value**: Comprehensive interfaces across all modules.
- [x] **Extend Express's Request type with decoded JWT payload**: Extended `Express.Request` interface with `user?: AuthUserPayload` ([express.d.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/@types/express.d.ts)).

---

## 6. Database Connection & Seeds
- [x] **`pg` behind Knex connection pool (pool size and credentials from env vars)**: Connection pool configured with `min` and `max` parameters from `.env`.
- [x] **Migrations + seeds — seed at least one rental that spans a month boundary**: Knex seed file ([01_seed_initial_data.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/database/seeds/01_seed_initial_data.ts)) seeds staff, vehicles, and a cross-month rental (`July 29 - Aug 3`).

---

## 🌟 7. Bonus (Optional) Requirements — ALL COMPLETED
- [x] **Wrap availability check and insert in a transaction (Concurrency Control)**: Implemented `db.transaction()` with `.forUpdate()` row locks on candidate active rentals to eliminate race conditions when two users attempt to book the same vehicle simultaneously.
- [x] **Pagination / Search on `/rentals`**: Supported pagination (`page`, `limit`) and search by customer name or phone (`?search=...`).
- [x] **Basic Rate Limiting on `/auth/login`**: Implemented `express-rate-limit` middleware limiting login attempts to 10 requests per 15 minutes per IP ([rateLimit.middleware.ts](file:///d:/Rafi_Sharkar/Project/vrm/src/middlewares/rateLimit.middleware.ts)).
- [x] **Interactive Swagger Documentation at `/docs`**: Live interactive Swagger UI served at **`http://localhost:3000/docs`**.

---

## 8. Deliverables
- [x] **Clean Codebase Structure**: Prepared for public Git repository.
- [x] **README with setup and run instructions**: Documented in [README.md](file:///d:/Rafi_Sharkar/Project/vrm/README.md).
- [x] **`.env.example`**: Committed with all required environment keys.
- [x] **Migration files**: Schema builds cleanly on an empty database.
