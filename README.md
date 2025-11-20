# TinyLink

Production-ready URL shortener powered by Node.js, Express, EJS, NeonDB (PostgreSQL) and Tailwind CSS.

## Features
- REST API for creating, listing, inspecting, and deleting short links
- Responsive dashboard with inline fetch + clipboard actions
- Stats page per short code with live metrics
- Health endpoint for uptime checks
- Render-friendly (uses `process.env.PORT` and pooled SSL connections)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create a `.env` file based on `.env.example` and provide your Neon connection string:
```
DATABASE_URL=postgres://...
BASE_URL=https://your-domain.com
```
If you are using the provided Neon instance, set:
```
DATABASE_URL=postgresql://neondb_owner:npg_Ue83yozVPFAX@ep-polished-unit-aho6gp0i-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BASE_URL=http://localhost:3000
```
Keep this file out of source control since it contains credentials.

### 3. Prepare the database
Run this schema once in Neon:
```sql
CREATE TABLE IF NOT EXISTS links (
  code TEXT PRIMARY KEY,
  longURL TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  lastClicked TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### 4. Run the server
```bash
npm run dev
```
The API will be available at `http://localhost:3000/api` by default.

### 5. Production build
Deploy directly to Render/Neon – no extra build step required. Ensure `DATABASE_URL` and `BASE_URL` env vars are present and outbound SSL is allowed.

## Scripts
- `npm start` – run the Express server
- `npm run dev` – start with nodemon for local dev
- `npm run lint` – syntax check the main entry point
- `npm test` – alias for the lint script

## API Reference
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/links` | Create a short link (validates URL + code) |
| `GET` | `/api/links` | List all links (newest first) |
| `GET` | `/api/links/:code` | Fetch stats for a single code |
| `DELETE` | `/api/links/:code` | Remove a link |

## Deployment Notes
- Uses pooled SSL with `rejectUnauthorized: false` for Neon compatibility
- Automatically respects `process.env.PORT`
- Static assets served from `/public`
- Views rendered with EJS + `express-ejs-layouts`
