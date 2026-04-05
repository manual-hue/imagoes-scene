import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'csz_admin';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

interface AdminSessionPayload {
  email: string;
  exp: number;
}

export interface AdminSession {
  email: string;
  expiresAt: number;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getConfiguredAdminEmail() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? '');
  return email || null;
}

function getAdminSecret() {
  const configuredSecret = process.env.ADMIN_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'local-admin-secret';
  }

  return null;
}

function signPayload(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function encodePayload(payload: AdminSessionPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
}

function decodePayload(value: string): AdminSessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf-8')) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function verifySignedToken(token: string): AdminSession | null {
  const secret = getAdminSecret();
  if (!secret) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload || typeof payload.email !== 'string' || typeof payload.exp !== 'number') {
    return null;
  }

  if (payload.exp <= Date.now()) {
    return null;
  }

  if (!isAllowedAdminEmail(payload.email)) {
    return null;
  }

  return {
    email: normalizeEmail(payload.email),
    expiresAt: payload.exp,
  };
}

function buildSignedToken(email: string) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error('ADMIN_SECRET is required in production');
  }

  const payload = encodePayload({
    email: normalizeEmail(email),
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
  });

  return `${payload}.${signPayload(payload, secret)}`;
}

export function isAllowedAdminEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const configuredEmail = getConfiguredAdminEmail();

  if (configuredEmail) {
    return normalizedEmail === configuredEmail;
  }

  return process.env.NODE_ENV !== 'production' && normalizedEmail.includes('@');
}

export function isAdminAuthConfigured() {
  return Boolean(getConfiguredAdminEmail() && getAdminSecret());
}

export async function createAdminSession(email: string) {
  if (!isAllowedAdminEmail(email)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, buildSignedToken(email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });

  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return token ? verifySignedToken(token) : null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}

export function isAuthorizedAdminRequest(req: NextRequest) {
  const configuredSecret = process.env.ADMIN_SECRET?.trim();
  const bearerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerToken = req.headers.get('x-admin-secret');

  if (configuredSecret && (bearerToken === configuredSecret || headerToken === configuredSecret)) {
    return true;
  }

  const cookieToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return cookieToken ? Boolean(verifySignedToken(cookieToken)) : false;
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}
