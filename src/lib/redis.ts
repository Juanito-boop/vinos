import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
	throw new Error('Missing REDIS_URL environment variable');
}

declare global {
	 
	var __redisClient: ReturnType<typeof createClient> | undefined;
}

/**
 * Returns a shared Redis client. Connects lazily and reuses the client across
 * module reloads (useful in dev/hot-reload environments).
 */
export async function getRedisClient() {
	if (global.__redisClient) return global.__redisClient;

	const client = createClient({ url: redisUrl });

	client.on('error', (err) => {
		// Keep a minimal log; don't throw here so callers can handle errors.
		// Next.js will show server logs in the platform.
		// If you want stricter behavior, rethrow or handle accordingly.
		 
		console.error('Redis client error:', err);
	});

	await client.connect();
	global.__redisClient = client;
	return client;
}

export async function disconnectRedisClient() {
	if (global.__redisClient) {
		try {
			await global.__redisClient.disconnect();
		} catch (e) {
			// ignore
		}
		global.__redisClient = undefined;
	}
}
