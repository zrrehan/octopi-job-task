# Resource Management API

A multi-tenant resource booking and availability management system. Multiple organizations can manage shared resources and allow members to create time-based bookings.

## Tech Stack

- **TypeScript** — Type safety
- **Node.js + Express.js** — API framework
- **MongoDB + Mongoose** — Database
- **Zod** — Request validation
- **Luxon** — Timezone-aware date/time handling
- **JWT** — Authentication

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/zrrehan/octopi-job-task.git
cd octopi-job-task
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
JWT_SECRET_KEY=your_secret_key_here
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Server runs at `http://localhost:3000`

---

## Project Structure

```
src/
├── config/              # Environment config
├── middleware/          # Auth + role guard middleware
├── models/              # Mongoose models (User, Organization, Resource, Booking)
├── modules/
│   ├── auth/            # Login & registration
│   ├── organization/    # Org management
│   ├── resource/        # Resource management
│   └── booking/         # Booking + availability engine
├── validations/         # Zod validation schemas
├── @types/              # Express type extensions
└── server.ts            # Entry point

DOCS/
├── auth.md              # Auth API documentation
├── organization.md      # Organization API documentation
├── resource.md          # Resource API documentation
└── booking.md           # Booking & availability API documentation
```

---

## API Documentation

Full API documentation is available in the `/DOCS` directory.

| Module | File |
|--------|------|
| Authentication | [DOCS/auth.md](./DOCS/auth.md) |
| Organization | [DOCS/organization.md](./DOCS/organization.md) |
| Resource | [DOCS/resource.md](./DOCS/resource.md) |
| Booking & Availability | [DOCS/booking.md](./DOCS/booking.md) |

---

## API Overview

### Auth
```
POST /api/v1/auth/signup       — Register new user
POST /api/v1/auth/signin       — Login
```

### Organization
```
POST /api/v1/organization/create          — Create organization (becomes ORG_ADMIN)
POST /api/v1/organization/add-member      — Add member by email (ORG_ADMIN only)
```

### Resource
```
POST   /api/v1/resource/create            — Create resource (ORG_ADMIN only)
GET    /api/v1/resource/:organizationId   — Get all resources
DELETE /api/v1/resource/:resourceId       — Soft delete resource (ORG_ADMIN only)
```

### Booking & Availability
```
GET    /api/v1/booking/availability   — Get available slots for a resource
POST   /api/v1/booking/book           — Create a booking
GET    /api/v1/booking/my-bookings    — Get my bookings
DELETE /api/v1/booking/:bookingId     — Cancel a booking
```

---

## Multi-Tenancy

Each organization operates in complete isolation:

- Users belong to organizations via the Organization document
- All queries are scoped to the organization
- A user can be `ORG_ADMIN` in one org and `EMPLOYEE` in another
- Roles are per-organization, not global

---

## Timezone Handling

- Each organization has its own timezone (e.g. `Asia/Dhaka`, `America/New_York`)
- All date/time operations use **Luxon**
- Times are stored in **UTC** in the database
- Times are returned in the **organization's timezone** in API responses
- Availability slots are generated in the organization's local time

---

## Availability Engine

The availability engine generates valid booking slots based on:

- Organization working hours
- Organization timezone
- Existing confirmed bookings
- Resource buffer time (gap between bookings)
- Requested booking duration
- Maximum advance booking days

---

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```