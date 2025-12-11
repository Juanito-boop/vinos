import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

// Simple debug endpoint to inspect the `wines:all` Redis key and allow
// setting/deleting test payloads from the runtime to validate cache behavior.

export async function GET() {
  const redis = await getRedisClient();
  const key = 'wines:all';
  const val = await redis.get(key);
  const exists = val !== null;
  const size = val ? Buffer.byteLength(val, 'utf8') : 0;
  let ttl: number | null = null;
  try {
    // TTL may return -1 (no expire) or -2 (key doesn't exist)
    ttl = await redis.ttl(key);
  } catch (e) {
    // ignore if TTL not supported
    ttl = null;
  }

  let sample = null;
  if (exists) {
    try {
      const parsed = JSON.parse(val as string);
      sample = Array.isArray(parsed) ? parsed.slice(0, 5) : parsed;
    } catch (_) {
      sample = null;
    }
  }

  return NextResponse.json({ key, exists, size, ttl, sample });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.action) {
    return NextResponse.json({ error: 'expected { action, key?, payload? }' }, { status: 400 });
  }

  const redis = await getRedisClient();
  const key = body.key ?? 'wines:all';

  if (body.action === 'setTest') {
    const payload = body.payload ?? [{ id: 'test-1', name: 'test wine' }];
    await redis.set(key, JSON.stringify(payload));
    return NextResponse.json({ ok: true, action: 'setTest', key });
  }

  if (body.action === 'del' || body.action === 'delete') {
    await redis.del(key);
    return NextResponse.json({ ok: true, action: 'del', key });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
