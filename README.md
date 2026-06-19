# Public Contact Intelligence Platform (PCIP)

A production-ready SaaS application for discovering and organizing **publicly available** business contact information from social media profiles and websites.

> **Privacy First**: This platform only collects information intentionally made public. It never accesses hidden, private, restricted, or non-public data.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Jobs**: In-process background processing (no Redis required)
- **Storage**: S3-compatible (MinIO for local dev)
- **AI**: OpenAI GPT-4o-mini (optional)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local install or Docker)

### 1. Clone and install

```bash
npm install
cp .env.example .env
```

### 2. Start infrastructure (optional)

If using Docker for PostgreSQL and MinIO:

```bash
npm run docker:up
```

This starts PostgreSQL and MinIO. You can also use a local PostgreSQL install instead.

### 3. Configure environment

Edit `.env` with your values. At minimum:

```env
DATABASE_URL="postgresql://pcip:pcip_secret@localhost:5432/pcip?schema=public"
AUTH_SECRET="your-secure-random-string-at-least-32-characters"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 4. Run database migrations

```bash
npm run db:deploy
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Searches, exports, and reports run in the background automatically — no separate worker process is needed.

## Project Structure

```
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Login, register, password reset
│   ├── (dashboard)/        # Protected dashboard pages
│   └── api/                # REST API endpoints
├── components/             # React components (UI + layout)
├── lib/
│   ├── auth/               # Authentication (NextAuth v5)
│   ├── collectors/         # Modular data collectors (A-D)
│   ├── data-quality/       # Confidence scoring engine
│   ├── ai/                 # LLM insights integration
│   ├── export/             # CSV, Excel, JSON export
│   ├── jobs/               # In-process background jobs
│   ├── services/           # Business logic processors
│   └── storage/            # S3-compatible storage
├── prisma/                 # Database schema & migrations
├── tests/                  # Vitest unit tests
└── .github/workflows/      # CI/CD pipeline
```

## Core Features

| Feature | Description |
|---------|-------------|
| **Search Workspace** | Analyze Instagram usernames, websites, company/brand names |
| **Collectors A-D** | Instagram, website, social discovery, company intelligence |
| **Confidence Scoring** | HIGH/MEDIUM/LOW based on source reliability |
| **Lead Dashboard** | Save, tag, note, filter, and export leads |
| **Reports** | Professional reports with AI insights |
| **Export** | CSV, Excel, JSON formats |
| **Admin Panel** | Users, searches, audit logs, API usage |
| **RBAC** | USER, ADMIN, SUPER_ADMIN roles |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/reset-password` | Password reset flow |
| GET/POST | `/api/searches` | List/create searches |
| GET | `/api/searches/[id]` | Search details |
| GET/POST/PATCH/DELETE | `/api/leads` | Lead management |
| GET/POST | `/api/exports` | Export leads |
| GET/POST | `/api/reports` | Report generation |
| GET/PATCH | `/api/user/profile` | User profile |
| GET | `/api/admin` | Admin dashboard data |
| GET | `/api/health` | Health check |

## Deployment

### Docker (Production)

```bash
# Set environment variables
export AUTH_SECRET=$(openssl rand -base64 32)
export OPENAI_API_KEY=sk-...

# Start full stack
docker compose --profile full up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

### Vercel + External Services

1. Deploy Next.js to Vercel
2. Use managed PostgreSQL (Neon, Supabase, RDS)
3. Use AWS S3 or Cloudflare R2 for exports

### Environment Variables (Production)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth secret (32+ chars) |
| `NEXTAUTH_URL` | Yes | App URL |
| `S3_*` | Yes | S3-compatible storage config |
| `OPENAI_API_KEY` | No | AI insights (falls back gracefully) |
| `SENTRY_DSN` | No | Error tracking |

## Testing

```bash
npm run test          # Run unit tests
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

## Security

- **RBAC**: Role-based access control (USER/ADMIN/SUPER_ADMIN)
- **Rate Limiting**: In-memory per-user rate limits
- **Input Validation**: Zod schemas on all API inputs
- **Audit Logging**: All sensitive actions logged
- **CSRF**: NextAuth session-based protection
- **Password Policy**: 8+ chars, upper, lower, number

## Contact Discovery Rules

**Allowed**: Public emails, phone numbers, addresses from websites, contact pages, footers, official profiles.

**Never attempted**: Hidden emails, private accounts, account recovery info, non-public records.

## License

Private — All rights reserved.
