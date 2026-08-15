import { randomUUID } from 'node:crypto';

const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const attemptsByAddress = new Map();

const allowedProjectTypes = new Set([
  'Mobile app',
  'Website',
  'Product design',
  'Other collaboration',
  'Ứng dụng di động',
  'Thiết kế sản phẩm',
  'Hợp tác khác',
]);

function json(response, status, payload, extraHeaders = {}) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  Object.entries(extraHeaders).forEach(([key, value]) => response.setHeader(key, value));
  return response.status(status).json(payload);
}

function oneHeader(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getClientAddress(request) {
  const forwarded = oneHeader(request.headers['x-forwarded-for']);
  return String(forwarded || request.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 64);
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

function asTrimmedString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength + 1) : '';
}

export function validateContactPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false };
  }

  const name = asTrimmedString(body.name, 80);
  const email = asTrimmedString(body.email, 254).toLowerCase();
  const projectType = asTrimmedString(body.projectType, 80);
  const message = asTrimmedString(body.message, 2000);
  const website = asTrimmedString(body.website, 200);
  const locale = body.locale === 'vi' ? 'vi' : 'en';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (website) return { ok: true, spam: true };
  if (
    name.length < 2 ||
    name.length > 80 ||
    !emailPattern.test(email) ||
    email.length > 254 ||
    !allowedProjectTypes.has(projectType) ||
    message.length < 20 ||
    message.length > 2000
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    spam: false,
    value: {
      name: name.replace(/[\r\n\u0000-\u001f\u007f]/g, ' '),
      email,
      projectType,
      message,
      locale,
    },
  };
}

function parseAllowedOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return json(response, 405, { ok: false, code: 'method_not_allowed' }, { Allow: 'POST' });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.CONTACT_TO_EMAIL?.trim();
  const sender = process.env.CONTACT_FROM_EMAIL?.trim();
  const allowedOrigin = parseAllowedOrigin(process.env.CONTACT_SITE_ORIGIN?.trim());

  if (!apiKey || !recipient || !sender || !allowedOrigin) {
    return json(response, 503, { ok: false, code: 'not_configured' });
  }

  const requestOrigin = oneHeader(request.headers.origin);
  if (!requestOrigin || requestOrigin !== allowedOrigin) {
    return json(response, 403, { ok: false, code: 'origin_rejected' });
  }

  const contentType = oneHeader(request.headers['content-type']) || '';
  const contentLength = Number(oneHeader(request.headers['content-length']) || 0);
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(response, 415, { ok: false, code: 'invalid_request' });
  }
  if (contentLength > MAX_BODY_BYTES) {
    return json(response, 413, { ok: false, code: 'invalid_request' });
  }

  if (isRateLimited(getClientAddress(request))) {
    return json(response, 429, { ok: false, code: 'rate_limited' }, { 'Retry-After': '600' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return json(response, 400, { ok: false, code: 'invalid_request' });
    }
  }

  try {
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) {
      return json(response, 413, { ok: false, code: 'invalid_request' });
    }
  } catch {
    return json(response, 400, { ok: false, code: 'invalid_request' });
  }

  const validation = validateContactPayload(body);
  if (!validation.ok) {
    return json(response, 400, { ok: false, code: 'invalid_request' });
  }

  // Silently accept honeypot submissions so automated senders receive no useful signal.
  if (validation.spam) {
    return json(response, 200, { ok: true });
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
      return json(response, 502, { ok: false, code: 'delivery_failed' });
    }

    return json(response, 200, { ok: true });
  } catch {
    return json(response, 502, { ok: false, code: 'delivery_failed' });
  }
}
