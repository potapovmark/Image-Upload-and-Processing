import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export async function getCachedImage(key: string): Promise<Buffer | null> {
  try {
    const cached = await redis.getBuffer(key);
    return cached;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedImage(key: string, buffer: Buffer, ttl: number = 3600) {
  try {
    await redis.setex(key, ttl, buffer);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}
