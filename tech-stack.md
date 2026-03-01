# Tech stack
- Node.js
- Express
- PostgreSQL
- Redis
- Docker
- REST APIs
- React for frontend
- API Documentation (swagger/ OpenAPI)  


what these are for: 

- Node.js → runs backend 
- Express → organizes endpoints & middleware 
- PostgreSQL → stores URLs, analytics, users 
- Redis → caches & rate-limits 
- Docker → packages everything for easy deployment 
- REST APIs → how frontend or clients talk to backend 
- React → optional dashboard frontend 
- Swagger → documents your API professionally


## Deployment:
- Backend + Redis + Postgres in Docker → works locally.
- Frontend: Minimal React dashboard, optional but looks nicer.
- Deploy backend to Render / Railway / Fly.io → gives a public URL.
- Optional deploy frontend → points to the deployed backend. Host React on Vercel/Netlify


## Todo
Add a couple sentences in overview or tech stack to explain why Redis + Docker + async clicks are important.  
Ensure your DB indexes and collision retry strategy are explicit somewhere.

Redis is used for caching URL lookups and storing rate-limiting counters, ensuring fast redirects under high load. Docker containerizes the application and dependencies, making it portable and easy to deploy. Click counts are updated asynchronously to avoid slowing down redirects, preserving performance at scale.

Slugs are generated using Base62 encoding (6–8 chars). On collision, the system retries up to 5 times before returning an error. Custom aliases are checked for availability at insertion, returning a 409 Conflict if already taken.

| Layer                 | Technology                                                       | Notes                                                  |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Runtime               | Node.js                                                          | Backend logic and API handling                         |
| Framework             | Express.js                                                       | Route handling and middleware                          |
| Database              | PostgreSQL                                                       | Persistent storage, indexes on `slug` for fast lookups |
| Cache / Rate Limiting | Redis                                                            | Fast caching, token-bucket rate limiting               |
| Frontend              | React (minimal dashboard)                                        | Optional dashboard for analytics                       |
| API Docs              | Swagger / OpenAPI                                                | Endpoint documentation                                 |
| Containerization      | Docker                                                           | Portable local dev & deployment                        |
| Deployment            | Render / Railway / Fly.io (backend), Vercel / Netlify (frontend) | Backend live demo; frontend optional                   |
