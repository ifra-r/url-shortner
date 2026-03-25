# Slash 
This URL Shortener is a fast, minimalist URL shortening service that lets users create short links with optional custom aliases and expiry dates. It tracks detailed analytics for each link, including total clicks, clicks per day, top visitor IPs, and recent activity. Designed with a clean interface and a fully documented REST API,

<!-- **Live Demo:** [url-shortner-two-hazel.vercel.app](https://url-shortner-two-hazel.vercel.app)  
**API Docs:** [url-shortner-production-24ea.up.railway.app/api-docs](https://url-shortner-production-24ea.up.railway.app/api-docs) -->

## Try Slash

1. **Live Demo (Frontend)** – [url-shortner-two-hazel.vercel.app](https://url-shortner-two-hazel.vercel.app)  
   Interact with the full web interface, create short links, and view analytics in real time.

2. **API Documentation (Swagger UI)** – [url-shortner-production-24ea.up.railway.app/api-docs](https://url-shortner-production-24ea.up.railway.app/api-docs)  
   Browse all API endpoints, see request/response schemas, and try requests directly from the browser.

3. **Direct API Testing (curl) with Deployed Backend** –  
   Test endpoints without the frontend using the deployed backend:  
   `https://url-shortner-production-24ea.up.railway.app/api/urls`  
   Examples are provided in the [Curl Examples](#curl-examples) section below.
 
demo:
<video src="./demo.mp4" autoplay loop muted></video>

---

## Features

- Shorten any URL instantly (with collision handling)
- Custom aliases (e.g. `/mylink`)
- Expiry dates with automatic 410 Gone response
- Redis caching on redirects to reduce DB hits
- Async click tracking via Redis queue, so, redirects never blocked
- Per-slug analytics: total clicks, clicks per day, top IPs, recent clicks
- Rate limiting (30 req/min per IP) via Redis
- Interactive API docs via Swagger UI
- Dockerized for local development

---

## Tech Stack

**Backend**
- Node.js
- Express
- PostgreSQL  
- Redis 
- Docker 

**Frontend**
- React
- Vite
- Tailwind CSS
- React Router

**Deployment**
- Backend → Railway
- Frontend → Vercel
- Swagger api docs

---

## Architecture

```
Client (Vercel)
    │
    ▼
Express API (Railway)
    │
    ├── PostgreSQL  — URLs, clicks, daily aggregates
    └── Redis       — redirect cache + click event queue + rate limiting
                            │
                     Click Worker (runs every 5s)
                            │
                     Bulk insert → PostgreSQL
```

**Redirect flow:**
```
GET /:slug
  → check Redis cache
  → hit: redirect immediately + push click event (async)
  → miss: query DB → cache result → redirect + push click event
```

---


## API Reference

Full interactive docs available at `/api-docs`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/urls` | Create a shortened URL |
| `GET` | `/:slug` | Redirect to original URL |
| `GET` | `/api/urls/:slug/analytics` | Get analytics for a slug |

## curl-examples
Create a short URL

```bash
curl -X POST https://url-shortner-production-24ea.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://github.com"}'
```

```json
{
  "id": 1,
  "shortUrl": "https://url-shortner-production-24ea.up.railway.app/aB3kRz",
  "originalUrl": "https://github.com",
  "createdAt": "2026-03-24T10:00:00.000Z"
}
```

### With custom alias and expiry

```bash
curl -X POST https://url-shortner-production-24ea.up.railway.app/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com",
    "alias": "gh",
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

### Get analytics

```bash
curl https://url-shortner-production-24ea.up.railway.app/api/urls/gh/analytics
```

---

## Database Schema

```sql
urls (id, short_url, original_url, created_at, expires_at)
clicks (id, slug, clicked_at, ip, user_agent)
clicks_daily (slug, date, click_count)
```

---

## Local Setup

For instructions on running Slash locally, see [DEV.md](./DEV.md).  
It includes prerequisites, Docker setup, environment variables, and test commands.  

## Project Structure

```
url-shortner/
  src/
    app.js                  — entry point, middleware, routes
    db.js                   — PostgreSQL pool
    dbSetup.js              — table creation on startup
    swagger.js              — OpenAPI spec config
    cache.js                — Redis client
    routes/
      url.routes.js         — route definitions + Swagger JSDoc
    controllers/
      url.controller.js     — createUrl, redirectUrl
      analytics.controller.js
    middleware/
      rateLimiter.js        — Redis-based rate limiting
    utils/
      urlHelpers.js         — slug generation, URL validation
      clickHelpers.js       — Redis click event queue
      analyticsHelpers.js   — analytics DB queries
    workers/
      clickWorker.js        — drains Redis queue, bulk inserts clicks
  client/                   — React frontend
  Dockerfile
  docker-compose.yml
```
 
