import { nanoid } from 'nanoid';

/** Generate a short URL-safe slug for shareable audit links */
export function generateSlug(): string {
  return nanoid(10);
}

/** Format a number as USD currency */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Validate email address format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Simple per-IP rate limiting state (in-memory for serverless) */
const ipSubmissions: Map<string, { count: number; resetAt: number }> = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS = 5;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipSubmissions.get(ip);

  if (!record || now > record.resetAt) {
    ipSubmissions.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_SUBMISSIONS) {
    return false;
  }

  record.count++;
  return true;
}
