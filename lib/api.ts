const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown; _retried?: boolean } = {},
): Promise<T> {
  const { json, _retried, headers, ...init } = options;
  const url = path.startsWith('http')
    ? path
    : `${BASE}/api${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (res.status === 401 && !_retried && !path.startsWith('/auth/')) {
    // Access token expired — rotate and retry exactly once.
    if (await tryRefresh()) {
      return api<T>(path, { ...options, _retried: true });
    }
  }

  const body = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // The API uses three different keys depending on the layer:
    // route handlers -> `message`, cart routes -> `msg`, global handler -> `error`.
    const message =
      body?.message ??
      body?.msg ??
      body?.error ??
      `Request failed (${res.status})`;
    const retryAfter =
      res.status === 429
        ? Number(res.headers.get('Retry-After')) || undefined
        : undefined;
    throw new ApiError(res.status, message, retryAfter);
  }

  return body as T;
}

export default api;
