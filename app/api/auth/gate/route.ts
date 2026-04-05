import { NextRequest, NextResponse } from 'next/server';
import { sha256 } from '@/lib/crypto';

const VALID_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE ?? '';
const COOKIE_NAME = 'csz_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { codeHash } = (await req.json()) as { codeHash?: string };

    if (!codeHash || typeof codeHash !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'INVALID_REQUEST' },
        { status: 400 },
      );
    }

    // Compare client-provided hash against server-side hash of the valid code
    const validHash = await sha256(VALID_CODE);

    if (codeHash !== validHash) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_CODE' },
        { status: 401 },
      );
    }

    // Set httpOnly cookie — the middleware checks for this
    const token = `csz_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
