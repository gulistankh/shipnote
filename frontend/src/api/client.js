// ============================================================
// api/client.js
// The ONE place the frontend talks to the backend.
//   api('/me')                                   -> GET
//   api('/auth/login', { method: 'POST', body })  -> POST with JSON
// Requests go to /api/... on the same origin (Vite proxy in development,
// a Vercel rewrite in production), so the HttpOnly login cookie is sent
// automatically. JavaScript never sees the token.
// Failed requests throw an ApiError with:
//   status, code (e.g. 'PLAN_LIMIT'), message, fields ({ email: '...' }), kind
// ============================================================

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || 'Something went wrong. Please try again.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code || 'UNKNOWN';
    this.fields = body?.error?.fields || {};
    this.kind = body?.error?.kind || null;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, { error: { code: 'NETWORK', message: 'Cannot reach the server. Check your connection.' } });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

// --- The API uses null for "unlimited"; the UI code uses Infinity ---
export function normalizeUsage(usage) {
  return {
    ...usage,
    maxPublished: usage.maxPublished ?? Infinity,
    maxProducts: usage.maxProducts ?? Infinity,
  };
}