# Job Board - Task 3: Role-based access, pagination, search and MVC

Builds on Task 2 and adds Admin and User roles, ownership rules, pagination, search and filtering, and a clean MVC folder structure.

**Stack:** Node.js, Express, MongoDB with Mongoose, JWT, bcrypt; React (Vite) frontend.

## Features

- Two roles: user (default) and admin. The role is stored in the user record and in the JWT
- Admins can manage every job and every user. Users can edit or delete only their own jobs (403 otherwise)
- Admin-only user management endpoints: list users, change a role, delete a user
- Pagination (?page and ?limit) and search and filters (?search, ?location, ?type)
- MVC structure: models, controllers, routes and middleware
- First admin created with "npm run seed:admin". Signup can never create an admin
- React pages: searchable and paginated job list, admin user management

## Project structure

```
server/
  server.js
  src/
    app.js
    config/db.js
    controllers/ (authController, jobController, userController)
    middleware/ (auth, role, errorHandler)
    models/ (User, Job)
    routes/ (authRoutes, jobRoutes, userRoutes)
    utils/ (AppError, asyncHandler, escapeRegex, generateToken, pagination, pick, seedAdmin)
client/            React app (Vite)
  src/ pages/ (Home, Login, Signup, Profile, Admin), components/, context/
```

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally, or a free MongoDB Atlas connection string

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # then edit .env
npm run dev
```

The API runs on http://localhost:5000.

Create the first admin account (uses ADMIN_EMAIL and ADMIN_PASSWORD from .env):

```bash
npm run seed:admin
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on http://localhost:5173. Vite proxies /api requests to the backend, so start the backend first.

## Environment variables (server/.env)

| Variable | Purpose |
|----------|---------|
| PORT | Server port (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Long random string used to sign tokens |
| JWT_EXPIRES_IN | Token lifetime, for example 7d |
| ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD | Used only by the seed:admin script |

## API endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a user (role is always "user") |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/profile` | Logged in | Get the current user profile |
| GET | `/api/jobs` | Public | List jobs. Query: page, limit, search, location, type |
| GET | `/api/jobs/:id` | Public | Get one job |
| POST | `/api/jobs` | Logged in | Create a job (you become its owner) |
| PUT | `/api/jobs/:id` | Owner or admin | Update a job (403 for other users) |
| DELETE | `/api/jobs/:id` | Owner or admin | Delete a job (403 for other users) |
| GET | `/api/users` | Admin | List users. Query: page, limit |
| PATCH | `/api/users/:id/role` | Admin | Change a user role (user or admin) |
| DELETE | `/api/users/:id` | Admin | Delete a user and their jobs |

Send the token on protected routes: `Authorization: Bearer <token>`.

### Job fields

`title` (3-100 characters), `company`, `location`, `type` (Full-time, Part-time, Contract, Internship or Remote), `salary` (number, 0 or more), `description` (at least 10 characters).

### Response format

Success: `{ "success": true, "data": ... }`. Error: `{ "success": false, "message": "..." }`.

### Status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error or invalid input |
| 401 | Missing, invalid or expired token, or wrong credentials |
| 403 | Authenticated but not allowed (wrong role or not the owner) |
| 404 | Resource or route not found |
| 409 | Conflict (duplicate email or duplicate application) |
| 429 | Too many requests (rate limit) |
| 500 | Server error |

## Testing with Postman

Import `docs/Job-Board-API.postman_collection.json`. Set the collection variable `baseUrl` if your server uses another address. The Signup and Login requests save the token automatically. The Create Job request saves `jobId` automatically.

To test admin routes, run `npm run seed:admin`, log in with the admin credentials, and call the /api/users endpoints. Calling them with a normal user returns 403.

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| server | `npm run dev` | Start the API with auto-reload |
| server | `npm start` | Start the API |
| server | `npm run seed:admin` | Create or promote the admin account |
| client | `npm run dev` | Start the React dev server |
| client | `npm run build` | Production build |
