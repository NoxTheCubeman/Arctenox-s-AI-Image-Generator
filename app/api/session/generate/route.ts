// /app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { assertAndConsume } from '@/lib/session';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Pull session key from header or cookie
    const token =
      req.headers.get('x-session-key') ??
      req.cookies.get('sessionKey')?.value;

    await assertAndConsume(token);

    const { prompt, size = '1024x1024' } = await req.json();

    const { image } = await generateImage({
      model: openai.image('gpt-image-1'), // or dall-e-3 / another provider
      prompt,
      size,
    });

    // Return as a data URL or stream
    const png = await image.arrayBuffer();
    return new NextResponse(png, {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Error' }, { status: 400 });
  }
}
