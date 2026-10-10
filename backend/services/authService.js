// ============================================================================
// HARVEST BRIDGE — Authentication & Authorization Service
// JWT Token Generator, PBKDF2 Password Verifier, Role Authorization Middleware
// ============================================================================

import crypto from 'node:crypto';
import { db, hashPassword, verifyPassword } from '../database/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'harvest-bridge-super-secure-production-jwt-key-2026';

// Minimalist RFC-7519 HMAC-SHA256 JWT Implementation (Zero-dependency)
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

export function generateToken(payload, expiresInHours = 72) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = { ...payload, exp };

  const encHeader = base64UrlEncode(JSON.stringify(header));
  const encBody = base64UrlEncode(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encHeader}.${encBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encHeader}.${encBody}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encHeader, encBody, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encHeader}.${encBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encBody));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// User Registration
export function registerUser({ name, phone, password, role = 'farmer', location, email, language = 'en', category, district }) {
  const cleanPhone = String(phone).trim().replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Valid 10-digit phone number is required.');
  }

  if (!name || name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = db.findOne('users', (u) => u.phone === cleanPhone);
  if (existing) {
    throw new Error('An account with this phone number already exists.');
  }

  const { hash, salt } = hashPassword(password);
  const user = db.insert('users', {
    name: name.trim(),
    phone: cleanPhone,
    email: email ? email.trim() : undefined,
    passwordHash: hash,
    passwordSalt: salt,
    role, // farmer | buyer | organization | admin
    category: category || (role === 'buyer' ? 'retailer' : role === 'organization' ? 'ngo' : undefined),
    language: language || 'en',
    location: location || 'Chittoor',
    district: district || location?.split(',')[1]?.trim() || 'Chittoor',
    verified: role === 'admin' ? true : false,
    cropsWanted: role === 'buyer' || role === 'organization' ? ['Tomato', 'Onion'] : undefined,
    capacity: role === 'buyer' || role === 'organization' ? 1000 : undefined,
  });

  const token = generateToken({ id: user._id, phone: user.phone, role: user.role });
  const sanitized = sanitizeUser(user);
  return { user: sanitized, token };
}

// User Login
export function loginUser({ phone, password }) {
  const cleanPhone = String(phone).trim().replace(/\D/g, '').slice(-10);
  const user = db.findOne('users', (u) => u.phone === cleanPhone);

  if (!user) {
    throw new Error('Invalid phone number or password.');
  }

  const isMatch = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isMatch) {
    throw new Error('Invalid phone number or password.');
  }

  const token = generateToken({ id: user._id, phone: user.phone, role: user.role });
  return { user: sanitizeUser(user), token };
}

export function sanitizeUser(user) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.passwordHash;
  delete copy.passwordSalt;
  return copy;
}

// Express Auth Middleware
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session token.' });
  }

  const user = db.findById('users', payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User account no longer exists.' });
  }

  req.user = sanitizeUser(user);
  next();
}

// Role Authorization Middleware
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}
