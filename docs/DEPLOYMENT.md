# Deployment Guide

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────▶│  PostgreSQL  │     │   S3 / R2   │
│  (Next.js)  │     │   (Neon)     │     │  (Exports)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

Background jobs (searches, exports, reports) run in-process within the Next.js server — no Redis or separate worker service is required.

## Option 1: Docker Compose (Self-Hosted)

Best for: VPS, dedicated servers, on-premises.

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. Start all services
docker compose --profile full up -d

# 3. Run migrations
docker compose exec app npx prisma migrate deploy

# 4. Create MinIO bucket
# Visit http://localhost:9001, login with minioadmin/minioadmin
# Create bucket: pcip-exports

# 5. Verify health
curl http://localhost:3000/api/health
```

### Production Hardening

- Replace default PostgreSQL/MinIO credentials
- Put Nginx/Caddy in front with TLS
- Set `AUTH_SECRET` to a cryptographically random 32+ char string
- Configure firewall: only expose ports 80/443
- Enable PostgreSQL backups
- Set up log aggregation (Datadog, Loki)

## Option 2: Vercel + Managed Services

Best for: Serverless, auto-scaling, low ops overhead.

### Services Needed

| Service | Provider Options |
|---------|-----------------|
| App hosting | Vercel |
| Database | Neon, Supabase, PlanetScale |
| Storage | AWS S3, Cloudflare R2 |
| Email | Resend, SendGrid (password reset) |

### Steps

1. **Database**: Create PostgreSQL instance, copy connection string
2. **Storage**: Create S3 bucket with IAM credentials
3. **Vercel**: Import repo, set environment variables
4. **Migrations**: Run `npx prisma migrate deploy` in Vercel build or CI

### Vercel Environment Variables

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
S3_ENDPOINT=https://...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=pcip-exports
OPENAI_API_KEY=sk-...
```

## Option 3: Kubernetes

For enterprise deployments with existing K8s infrastructure.

- Deploy app as Deployment + Service + Ingress
- Use managed PostgreSQL outside cluster
- Use IRSA/workload identity for S3 access
- Configure HPA on app based on CPU/request load

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR:

1. Lint (ESLint)
2. Type check (tsc)
3. Unit tests (Vitest)
4. Build (next build)
5. Docker image build (main branch only)

### Release Process

1. Merge to `main`
2. CI passes
3. Deploy app (Vercel auto-deploy or manual Docker push)
4. Run `prisma migrate deploy` if schema changed
5. Verify `/api/health`

## Monitoring

- **Health**: `GET /api/health` — database connectivity
- **Logs**: Structured JSON logging via `lib/logger.ts`
- **Audit**: All actions in `AuditLog` table
- **Sentry**: Set `SENTRY_DSN` for error tracking

## Scaling

| Component | Scale Strategy |
|-----------|---------------|
| App (Next.js) | Horizontal — multiple instances behind load balancer |
| PostgreSQL | Vertical + read replicas for reporting |
| S3 | Unlimited — no scaling needed |

> **Note**: In-memory rate limits are per server instance. For multi-instance deployments, consider a shared rate-limit store or API gateway rate limiting.

## Backup Strategy

- **PostgreSQL**: Daily automated backups, 30-day retention
- **S3**: Versioning enabled, cross-region replication optional
