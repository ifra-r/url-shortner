# Funtional Requiremnets 

## Create short URL / Custom alias / Expiration
- Users should be able to submit a long URL and receive a shortened version.
    - Optionally, users should be able to specify a custom alias for their shortened URL (ie. "www.short.ly/my-custom-alias")
    - Optionally, users should be able to specify an expiration date for their shortened URL.
- Users should be able to access the original URL by using the shortened URL

## Rate Limiting / Abuse Prevention

- Limit how many URLs a user/IP can create per minute/hour/day. 
- Prevent someone from spamming the system or creating billions of junk links.  

## Redirect Optimization

- Use caching (Redis) to ensure fast lookups for short URLs.
- TTL aligned with expiration date (TTL / cache invalidation rules- keep simple)
- Consider async click count increment to keep redirect fast.

## Analytics Details

- Total click count per link
- Async increment
- Daily click aggregation

## Slug Generation & Collision Handling

- Base62 / NanoID / hash-based IDs.
- Collision resolution strategy (especially for custom slugs).
(Use Base62 encoding for ID generation. Enforce uniqueness at DB level with retry on collision.)

## Dashboard / Reporting

- A basic API or minimal frontend for users to see their links and analytics.
- Pagination. 

## Expiry & Cleanup
- Auto-remove expired links or mark as inactive.
- Cron or scheduled jobs to cleanup old data.
Background job runs periodically. Marks expired links inactive (don’t delete)

# Non-Funtional Requiremnets 


## Performance & Caching 
- Target average redirect latency under 100ms under normal load.
Use Redis caching for redirect lookups with simple TTL aligned to expiration.

## Data Persistence & Reliability
- The system should ensure uniqueness for the short codes (each short code maps to exactly one long URL)
- Ensure click counts aren’t lost (background jobs, durable storage).
Future scaling: Sharding / partitioning for huge scale (1B+ URLs).

## Security
- Malicious URL detection.
- Input validation.
- Rate limiting
- HTTPS / TLS if deployed.

## Monitoring & Logging
- Error logging.
- Metrics for system performance (requests per second, DB latency, cache hits).

## Deployment & DevOps

- Dockerized deployment.
- Environment variables for config.
- Multi-service setup if using background workers (Redis + DB + API service).
