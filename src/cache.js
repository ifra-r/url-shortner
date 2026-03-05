// create redis client that Node can talk to
const { createClient } = require('redis');

// use env url if provides else default
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

// connect on app startup
(async () => {
  await client.connect();
})();

// export client so controller can talk to redis
module.exports = client;