// /app/api/session/route.ts
import { NextResponse } from 'next/server';
import { mintSession } from '@/lib/session';

export async function POST() {
  const token = await mintSession();

  // Also set a secure cookie so the client doesn’t need to store it manually
  const res = NextResponse.json({ sessionKey: token });
  res.cookies.set('sessionKey', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: parseInt(process.env.SESSION_TTL_SECONDS ?? '3600', 10),
  });
  return res;
}
