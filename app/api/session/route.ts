// /app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { experimental_generateText as generateText } from 'ai';
import { assertAndConsume } from '@/lib/session';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const token =
      req.headers.get('x-session-key') ??
      req.cookies.get('sessionKey')?.value;

    await assertAndConsume(token);

    const { prompt } = await req.json();

    // Gemini provider
    const { text } = await generateText({
      model: google('gemini-1.5-pro'), // choose gemini-1.5-flash/pro etc.
      prompt,
    });

    return NextResponse.json({ output: text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error' }, { status: 400 });
  }
}

