# Project Setup & Implementation Roadmap

## Step 1: Project Skeleton / Setup

* **Initialize Node.js project:** `npm init -y`
* **Install core dependencies:**

  * Express → `npm i express`
  * PostgreSQL client → `npm i pg`
  * Redis client → `npm i ioredis`
  * Others: `dotenv`, `swagger-ui-express`, `cors`, etc.
* Setup folder structure

        /src
        /controllers
        /routes
        /models
        /services
        /utils
        /tests
        /docker-compose.yml
        .env
        README.md

* **Optional:** Dockerfile for Node.js service
* **Goal:** Clean structure before writing any logic.

## Step 2: Database Setup

* Spin up Postgres locally or via Docker
* Create tables from schema: `urls`, `clicks`, `daily_click_counts`
* Add indexes:

  * `slug` in `urls` (fast lookup)
  * `clicked_at` in `clicks` (analytics queries)
* Test DB connection from Node.js
* **Goal:** Ensure app can read/write from DB.

## Step 3: Redis Setup

* Spin up Redis (local or Docker)
* Write a simple caching test:

  * Store a key
  * Retrieve it
  * Delete it
* Implement rate-limiting logic skeleton in Redis
* **Goal:** Prepare caching and rate-limiting before core URL logic.

## Step 4: Core Features (Backend)

* Slug generation → Base62 / NanoID
* Create short URL endpoint → store in DB + cache in Redis
* Redirect endpoint → check Redis first, fallback to DB, async increment click count
* Collision handling → retry logic + custom alias check
* Expiry handling → scheduled job / TTL in Redis
* **Goal:** Backend fully functional before frontend.

## Step 5: Analytics + Dashboard APIs

* Endpoint to fetch click counts per link
* Daily aggregation logic
* Pagination on list endpoints
* **Goal:** Demonstrate understanding of async jobs, aggregation, and performance-aware design.

## Step 6: Optional Frontend (React)

* Simple dashboard:

  * Form to create short URLs
  * Table of user’s links + click counts
* Connect via REST API to backend
* **Goal:** Add polish, backend is the main focus.

## Step 7: Docker & Local Testing

* Write Dockerfile for Node app
* Docker-compose for backend + Postgres + Redis
* Test `docker-compose up` → everything works locally
* **Goal:** Recruiters/testers can run project in one command.

## Step 8: Deployment

* Deploy backend first → public URL
* Optional: Deploy frontend → connects to backend URL
* Update README with live demo link + instructions
* **Goal:** Make project publicly accessible and testable.

## Step 9: Documentation & Polish

* API docs via Swagger/OpenAPI
* README with screenshots, instructions, and project explanation
* Optional: GIFs showing frontend usage
* **Goal:** Make repo recruiter-ready.

