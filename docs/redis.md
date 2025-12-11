# Redis cache usage (wines)

Endpoints:

- GET /api/wines
  - Returns cached data if present: { cached: true, data }
  - On cache miss it fetches from Supabase, stores the result in Redis under `wines:all` and returns { cached: false, data }

- POST /api/wines
  - Body: { action: 'set'|'del'|'delete', key?: string, payload?: any }
  - Use to explicitly set or delete the cache (realtime should call delete on updates)

- GET /api/wines/debug
  - Debug: returns { key, exists, size, ttl, sample }

- POST /api/wines/debug
  - Body: { action: 'setTest'|'del', key?, payload? }
  - Use to set a small test payload or delete the key for testing.

Examples (server-side fetch):

```js
// populate/read cache (server-side)
const res = await fetch('http://localhost:3000/api/wines');
const json = await res.json();
if (json.cached) {
  const wines = json.data;
  // use cached wines
} else {
  // first-time fetched from Supabase and cached
}
```

Example: set cache from realtime webhook

```js
await fetch('https://your-site.com/api/wines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'set', payload: winesJson })
});
```

Example: invalidate cache on updates

```js
await fetch('https://your-site.com/api/wines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'del' })
});
```

Quick test with debug endpoint (curl / fetch):

```js
// check status
await fetch('http://localhost:3000/api/wines/debug').then(r => r.json()).then(console.log)

// set test
await fetch('http://localhost:3000/api/wines/debug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setTest' }) })

// delete
await fetch('http://localhost:3000/api/wines/debug', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'del' }) })
```

Notes:
- Ensure `REDIS_URL` is set in your environment.
- Consider protecting POST endpoints (HMAC token) for production.
