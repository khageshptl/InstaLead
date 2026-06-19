# Testing Strategy

## Overview

PCIP uses a layered testing approach focused on business-critical logic.

## Test Layers

### 1. Unit Tests (Vitest)

Location: `tests/`

Current coverage:
- **Data quality scoring** (`tests/scoring.test.ts`) — confidence levels, deduplication
- **Validation schemas** (`tests/validations.test.ts`) — Zod input validation

Run:
```bash
npm run test
npm run test:watch   # watch mode
```

### 2. Integration Tests (Recommended Additions)

Test API routes with a test database:

```typescript
// tests/api/searches.test.ts (future)
// - POST /api/searches creates search record
// - GET /api/searches returns user's searches
// - Rate limiting returns 429 when exceeded
```

Setup pattern:
- Use `vitest` with `beforeAll` to run migrations against test DB
- Mock background job runners in API tests

### 3. Collector Tests (Recommended Additions)

Test collectors with mocked fetch responses:

```typescript
// tests/collectors/website.test.ts (future)
// - Extracts emails from footer HTML
// - Discovers contact page URLs
// - Parses schema.org JSON-LD
// - Does NOT extract hidden/obfuscated emails
```

### 4. E2E Tests (Recommended: Playwright)

Critical user flows to test:
1. Register → Login → Dashboard
2. Create search → View results → Save lead
3. Export leads → Download file
4. Generate report → View AI insights
5. Admin panel access control

### 5. Manual QA Checklist

Before each release:

- [ ] Registration and login work
- [ ] Password reset flow (token generation)
- [ ] Search processes in the background
- [ ] Contacts display with confidence scores
- [ ] Lead save/tag/note/update
- [ ] CSV/Excel/JSON export downloads
- [ ] Report generation with AI insights
- [ ] Admin panel restricted to ADMIN role
- [ ] Rate limiting triggers on rapid searches
- [ ] Dark mode toggle works
- [ ] Mobile responsive layout

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`):

```
push/PR → install → prisma generate → migrate → lint → typecheck → test → build
```

Main branch additionally builds Docker image.

## Test Data

Never use real personal data in tests. Use:
- `example.com` domains
- `test@example.com` emails
- Mock HTML fixtures for collector tests

## Coverage Goals

| Area | Target |
|------|--------|
| Validation schemas | 100% |
| Confidence scoring | 100% |
| Collectors | 80% |
| API routes | 70% |
| UI components | 50% (critical paths via E2E) |
