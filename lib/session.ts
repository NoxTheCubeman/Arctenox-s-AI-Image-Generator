import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

const SESSION_TTL = parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10);
const SESSION_RATE_LIMIT = parseInt(process.env.SESSION_RATE_LIMIT ?? '20', 10);

export async function createSession() {
  const id = uuidv4();
  await kv.set(`session:${id}:uses`, 0, { ex: SESSION_TTL });
  return id;
}

export async function assertAndConsume(id?: string) {
  if (!id) throw new Error('No session key provided');
  const key = `session:${id}:uses`;
  const uses = await kv.incr(key);
  if (uses === 1) await kv.expire(key, SESSION_TTL);
  if (uses > SESSION_RATE_LIMIT) throw new Error('Session quota exceeded');
  return true;
}
