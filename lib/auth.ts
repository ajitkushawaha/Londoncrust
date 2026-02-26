import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const SESSION_COOKIE_NAME = 'session_token';
export const GUEST_SESSION_COOKIE_NAME = 'guest_session_token';
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const GUEST_SESSION_TTL_MS = Number(process.env.GUEST_SESSION_TTL_MS) || 60 * 60 * 1000;

interface DbUser {
  _id: ObjectId;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  role: 'admin';
}

interface DbSession {
  _id: ObjectId;
  token: string;
  userId: ObjectId;
  createdAt: number;
  expiresAt: number;
}

interface DbGuestSession {
  _id: ObjectId;
  token: string;
  tableId: string;
  phone: string;
  consent: boolean;
  createdAt: number;
  expiresAt: number;
}
function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actual = hashPassword(password, salt);
  const expected = Buffer.from(expectedHash, 'hex');
  const actualBuf = Buffer.from(actual, 'hex');
  if (expected.length !== actualBuf.length) return false;
  return timingSafeEqual(expected, actualBuf);
}

export async function ensureDefaultAdmin() {
  const db = await getDb();
  const users = db.collection<DbUser>('users');
  const existing = await users.findOne({ username: DEFAULT_ADMIN_USERNAME });
  if (existing) return existing;

  const salt = randomBytes(16).toString('hex');
  const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD, salt);
  const res = await users.insertOne({
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash,
    passwordSalt: salt,
    role: 'admin',
  } as DbUser);
  return {
    _id: res.insertedId,
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash,
    passwordSalt: salt,
    role: 'admin',
  } as DbUser;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  return db.collection<DbUser>('users').findOne({ username });
}

export async function createSession(userId: ObjectId) {
  const db = await getDb();
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const session: Omit<DbSession, '_id'> = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  await db.collection<DbSession>('sessions').insertOne(session as DbSession);
  return session;
}

export async function getSessionByToken(token: string) {
  const db = await getDb();
  const session = await db.collection<DbSession>('sessions').findOne({ token });
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    await db.collection<DbSession>('sessions').deleteOne({ _id: session._id });
    return null;
  }
  return session;
}

export async function deleteSession(token: string) {
  const db = await getDb();
  await db.collection<DbSession>('sessions').deleteOne({ token });
}

export async function createGuestSession(
  tableId: string,
  phone: string,
  consent: boolean,
) {
  const db = await getDb();
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const session: Omit<DbGuestSession, '_id'> = {
    token,
    tableId,
    phone,
    consent,
    createdAt: now,
    expiresAt: now + GUEST_SESSION_TTL_MS,
  };
  await db.collection<DbGuestSession>('guest_sessions').insertOne(session as DbGuestSession);
  return session;
}

export async function getGuestSessionByToken(token: string) {
  const db = await getDb();
  const session = await db
    .collection<DbGuestSession>('guest_sessions')
    .findOne({ token });
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    await db
      .collection<DbGuestSession>('guest_sessions')
      .deleteOne({ _id: session._id });
    return null;
  }
  return session;
}

export function getGuestSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(GUEST_SESSION_TTL_MS / 1000),
  };
}

export async function verifyUserPassword(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const ok = verifyPassword(password, user.passwordSalt, user.passwordHash);
  return ok ? user : null;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}
