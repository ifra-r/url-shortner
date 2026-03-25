
## Local Development

### Prerequisites
- Docker + Docker Compose
- Node.js 18+

### Run with Docker

```bash
git clone https://github.com/ifra-r/url-shortner.git
cd url-shortner
cp .env.example .env   # fill in your values
docker compose up --build
```

App runs at `http://localhost:5000`  
API docs at `http://localhost:5000/api-docs`

### Run Frontend

```bash
cd client
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `BASE_URL` | Public base URL | `https://your-app.up.railway.app` |
| `DB_HOST` | Postgres host | `postgres` (Docker) or Railway host |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USER` | Postgres user | `postgres` |
| `DB_PASSWORD` | Postgres password | `yourpassword` |
| `DB_NAME` | Postgres database name | `url_shortener` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `https://yourapp.vercel.app,http://localhost:5173` |

### Frontend (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

---

## Test Your Setup

### 1. Test Backend

Create a short URL:

```bash
curl -X POST http://localhost:5000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com"}
```

Expected: JSON response with shortUrl and id.

check redirect:
curl -i <shortnered link>

Check analytics (replace :slug with the generated short URL slug):

curl http://localhost:5000/api/urls/:slug/analytics

## 2. Test Frontend

Open in your browser:

`http://localhost:5173`

Try creating a URL and confirm it redirects correctly.
This is clean, to the point, and fits nicely into your `dev.md` right after the environment variables.