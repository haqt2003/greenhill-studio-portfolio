import { randomUUID } from 'node:crypto';
import { validateContactPayload } from '../../api/contact.js';

const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const attemptsByAddress = new Map();

function json(status, payload, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function parseAllowedOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function getClientAddress(request, context) {
  return String(
    context?.ip
      || request.headers.get('x-nf-client-connection-ip')
      || request.headers.get('x-forwarded-for')
      || 'unknown',
  ).split(',')[0].trim().slice(0, 64);
}

function isRateLimited(address) {
  const now = Date.now();
  const recentAttempts = (attemptsByAddress.get(address) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    attemptsByAddress.set(address, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  attemptsByAddress.set(address, recentAttempts);
  return false;
}

export default async function handler(request, context) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, code: 'method_not_allowed' }, { Allow: 'POST' });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.CONTACT_TO_EMAIL?.trim();
  const sender = process.env.CONTACT_FROM_EMAIL?.trim();
  const allowedOrigin = parseAllowedOrigin(process.env.CONTACT_SITE_ORIGIN?.trim());

  if (!apiKey || !recipient || !sender || !allowedOrigin) {
    return json(503, { ok: false, code: 'not_configured' });
  }

  if (request.headers.get('origin') !== allowedOrigin) {
    return json(403, { ok: false, code: 'origin_rejected' });
  }

  const contentType = request.headers.get('content-type') || '';
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, code: 'invalid_request' });
  }
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, code: 'invalid_request' });
  }

  if (isRateLimited(getClientAddress(request, context))) {
    return json(429, { ok: false, code: 'rate_limited' }, { 'Retry-After': '600' });
  }

  let rawBody;
  try {
    rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return json(413, { ok: false, code: 'invalid_request' });
    }
  } catch {
    return json(400, { ok: false, code: 'invalid_request' });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json(400, { ok: false, code: 'invalid_request' });
  }

  const validation = validateContactPayload(body);
  if (!validation.ok) {
    return json(400, { ok: false, code: 'invalid_request' });
  }

  if (validation.spam) {
    return json(200, { ok: true });
  }

  const { name, email, projectType, message, locale } = validation.value;
  const subject = locale === 'vi'
    ? `Tin nhắn mới từ ${name}`
    : `New message from ${name}`;
  const text = locale === 'vi'
    ? `Tên: ${name}\nEmail: ${email}\nLoại dự án: ${projectType}\n\nLời nhắn:\n${message}`
    : `Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\n\nMessage:\n${message}`;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `greenhill-contact-${randomUUID()}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!resendResponse.ok) {
      return json(502, { ok: false, code: 'delivery_failed' });
    }

    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, code: 'delivery_failed' });
  }
}
