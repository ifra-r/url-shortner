# Software Requirements Specification
## URL Shortener Service

**Version:** 1.0  
**Date:** Feburary 2026  
**Author:** Ifra Abdul Rauf  

---

## 1. Overview

A backend-focused URL shortening service that converts long URLs into short, shareable links. Supports custom aliases, link expiration, click analytics, and rate limiting. Built with Node.js, Express, PostgreSQL, and Redis.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Cache / Rate Limiting | Redis |
| Frontend | React (minimal dashboard) |
| API Docs | Swagger / OpenAPI |
| Containerization | Docker |
| Deployment |  Railway(backend), Vercel(frontend) |

---

## 3. Functional Requirements

### 3.1 URL Creation
- Accept a long URL and return a shortened version with a unique slug.
- Optionally allow a user-specified custom alias (e.g. `short.ly/my-alias`).
- Optionally allow a user-specified expiration date.
- Validate that the submitted URL is well-formed.

### 3.2 Redirection
- Resolve a short slug to its original URL and issue an HTTP 301/302 redirect.
- Return 404 if the slug does not exist or has expired.

### 3.3 Slug Generation & Collision Handling
- Generate slugs using Base62 encoding by default.
- Enforce uniqueness at the database level with a unique constraint on the slug column.
- On collision, retry generation up to N times before returning an error.
- For custom aliases, check availability before insertion and return a clear conflict error if taken.

### 3.4 Link Expiry & Cleanup
- Support optional expiration timestamps per link.
- Expired links return 410 Gone on redirect.
- A scheduled background job runs periodically to mark expired links as inactive (soft delete — do not remove records).

### 3.5 Rate Limiting & Abuse Prevention
- Limit URL creation requests per IP per minute / hour / day.
- Rate limit state stored in Redis with sliding window or token bucket strategy.
- Clients that exceed limits receive HTTP 429 Too Many Requests with a Retry-After header.

### 3.6 Analytics
- Track total click count per link.
- Increment click count asynchronously (fire-and-forget) to avoid adding latency to the redirect path.
- Record a daily aggregation of clicks per link (date + count).
- Expose analytics data via API endpoint.

### 3.7 Dashboard / Reporting API
- Authenticated endpoint to list a user's links with metadata (original URL, slug, created at, expiry, total clicks).
- Pagination support on list endpoint (limit + offset or cursor-based).
- Per-link endpoint returning click analytics including daily breakdown.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Target average redirect latency under 100ms under normal load.
- Redis caches slug → URL mappings. Cache TTL aligned with link expiration.
- Cache invalidated immediately on link deactivation or deletion.

### 4.2 Data Integrity
- Each short code maps to exactly one long URL (enforced by DB unique constraint).
- Click counts are persisted to the database; async increments must not result in permanent data loss.

### 4.3 Security
- Input validation on all endpoints (URL format, alias format, date format).
- Rate limiting on creation and redirect endpoints.
- HTTPS / TLS enforced in production deployment.
- Basic malicious URL detection (blocklist check or third-party API integration — optional / stretch goal).

### 4.4 Logging & Monitoring
- Structured error logging for all 4xx/5xx responses.
- Request logging (method, path, status, latency).
- Metrics tracked: requests per second, DB query latency, Redis cache hit/miss ratio.

### 4.5 Deployment
- All services (API, PostgreSQL, Redis) containerized with Docker Compose for local development.
- Environment-based configuration via `.env` (no hardcoded secrets).
- CI-ready structure (clear separation of app, config, and infra).

---

## 5. API Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/urls` | Create a shortened URL |
| GET | `/:slug` | Redirect to original URL |
| GET | `/api/urls` | List user's links (paginated) |
| GET | `/api/urls/:slug/analytics` | Get click analytics for a link |
| DELETE | `/api/urls/:slug` | Deactivate a link |

Full API documentation available via Swagger UI at `/api/docs`.

---

## 6. Database Schema (Overview)

**urls**
- `id` — primary key
- `slug` — unique short code
- `original_url` — destination URL
- `custom_alias` — boolean flag
- `expires_at` — nullable timestamp
- `is_active` — boolean
- `created_at` — timestamp

**clicks**
- `id` — primary key
- `slug` — foreign key to urls
- `clicked_at` — timestamp

**daily_click_counts**
- `slug` — foreign key
- `date` — date
- `count` — integer
- Unique constraint on (slug, date)

---

## 7. Out of Scope (Stretch Goals)

- User authentication and accounts
- QR code generation per link
- Geographic click analytics (country / city breakdown)
- Malicious URL scanning via external API
- Horizontal scaling / DB sharding for 1B+ URLs