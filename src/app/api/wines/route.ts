import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { WineService } from '@/lib/services/wine-service';

/**
 * GET: returns cached wines from Redis if present.
 * - 200 + { cached: true, data: [...] } when cache hit
 * - 204 when cache miss (cached: false)
 *
 * POST: accept { action: 'set'|'del'|'delete', key?: string, payload?: any }
 * - action: 'set' -> store payload at key (default 'wines:all') indefinitely
 * - action: 'del'|'delete' -> delete the key
 */

export async function GET() {
	const redis = await getRedisClient();
	const key = 'wines:all';
	const cached = await redis.get(key);
	if (cached) {
		try {
			return NextResponse.json({ cached: true, data: JSON.parse(cached) });
		} catch (e) {
			// If the cache is corrupted, remove it and treat as a miss
			await redis.del(key);
			// 204 responses must not have a body; return 200 with explicit cached:false
			return NextResponse.json({ cached: false }, { status: 200 });
		}
	}

	// Avoid returning 204 with a body (invalid). Return 200 and indicate cache miss.
	// Cache miss: fetch from Supabase (WineService), populate Redis and return data.
	try {
		const wines = await WineService.getAllWines();
		// store in redis indefinitely until invalidated by POST del
		await redis.set(key, JSON.stringify(wines));
		return NextResponse.json({ cached: false, data: wines }, { status: 200 });
	} catch (err: any) {
		console.error('Error fetching wines on cache miss:', err);
		return NextResponse.json({ error: 'failed to fetch wines' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const body = await req.json().catch(() => null);
	if (!body || !body.action) {
		return NextResponse.json({ error: 'invalid body, expected { action, key?, payload? }' }, { status: 400 });
	}

	const redis = await getRedisClient();
	const key = body.key ?? 'wines:all';

	if (body.action === 'set') {
		if (body.payload === undefined) {
			return NextResponse.json({ error: 'missing payload for set' }, { status: 400 });
		}
		await redis.set(key, JSON.stringify(body.payload));
		// no expiry: persist until a del happens
		return NextResponse.json({ ok: true });
	}

	if (body.action === 'del' || body.action === 'delete') {
		await redis.del(key);
		return NextResponse.json({ ok: true });
	}

	return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
