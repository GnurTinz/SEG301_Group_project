export interface Envelope<T> {
  data: T;
  meta?: { page: number; pageSize: number; total: number; totalPages: number; searchId?: string };
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  const headers = new Headers(init.headers);
  if (init.method && !['GET', 'HEAD'].includes(init.method)) {
    const r = await fetch('/api/v1/auth/csrf', { credentials: 'include' });
    const token = await r.json();
    if (!r.ok) throw new ApiError(r.status, 'Không thể tạo phiên bảo mật');
    headers.set('X-CSRF-Token', token.data.csrfToken);
    if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`/api/v1${path}`, { ...init, headers, credentials: 'include' });
  const text = await response.text();
  let body: { error?: { message?: string } } | null;
  try {
    body = text ? (JSON.parse(text) as { error?: { message?: string } }) : null;
  } catch {
    body = null;
  }
  if (!response.ok)
    throw new ApiError(
      response.status,
      body?.error?.message ?? `Không thể kết nối máy chủ (${response.status})`,
    );
  if (!body) throw new ApiError(response.status, 'Phản hồi máy chủ không hợp lệ');
  return body as unknown as Envelope<T>;
}
export const send = <T>(path: string, method: string, data: unknown = {}) =>
  api<T>(path, { method, body: JSON.stringify(data) });
