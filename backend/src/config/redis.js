const Redis = require('ioredis');
const logger = require('./logger');

let client = null;
const enabled = process.env.REDIS_ENABLED === 'true';

if (enabled) {
  try {
    client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    client.on('error', (err) => logger.warn('Redis error: %s', err.message));
  } catch (err) {
    logger.warn('Redis unavailable: %s', err.message);
    client = null;
  }
}

async function get(key) {
  if (!client) return null;
  try {
    if (client.status !== 'ready') await client.connect();
    return client.get(key);
  } catch {
    return null;
  }
}

async function set(key, value, ttlSeconds = 3600) {
  if (!client) return;
  try {
    if (client.status !== 'ready') await client.connect();
    await client.set(key, value, 'EX', ttlSeconds);
  } catch {
    // no-op when redis is down
  }
}

async function del(key) {
  if (!client) return;
  try {
    if (client.status !== 'ready') await client.connect();
    await client.del(key);
  } catch {
    // no-op
  }
}

module.exports = { client, enabled, get, set, del };
