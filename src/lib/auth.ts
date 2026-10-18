import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserRole } from '../types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'shahi_dawan_super_secret_jwt_key_2026_luxury_erp';
const key = new TextEncoder().encode(SESSION_SECRET);

export const SESSION_COOKIE_NAME = 'shahi_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  expiresAt: number;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT session token
 */
export async function encryptSession(payload: Omit<SessionPayload, 'expiresAt'>): Promise<string> {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verify JWT session token
 */
export async function decryptSession(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Set session HTTP-only cookie in Next.js Server Components or Route Handlers
 */
export async function setSessionCookie(payload: Omit<SessionPayload, 'expiresAt'>): Promise<void> {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Delete session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Get current session user from request cookies
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return decryptSession(token);
  } catch (e) {
    return null;
  }
}
