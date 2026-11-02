import type { Envelope, Session } from './types';

export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message); this.name = 'ApiError'; }
}
export interface SessionStorage { read(): Promise<string | null>; write(value: string): Promise<void>; clear(): Promise<void> }
export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const s = value as Session;
  return typeof s.accessToken === 'string' && !!s.accessToken && typeof s.refreshToken === 'string' && !!s.refreshToken && typeof s.user?.id === 'number' && typeof s.user?.email === 'string';
}

/** Native requests deliberately omit cookies: the existing API accepts Bearer + refreshToken JSON. */
export class ApiClient {
  private session: Session | null = null;
  private generation = 0;
  private refreshing: Promise<void> | null = null;
  private storageQueue: Promise<unknown> = Promise.resolve();
  onAuthLost: () => void = () => {};

  constructor(private baseUrl: string, private storage: SessionStorage, private transport: typeof fetch = fetch) {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1', '10.0.2.2'].includes(parsed.hostname)) throw new Error('Use HTTPS for the API server.');
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }
  private enqueueStorage(action: () => Promise<void>) {
    const result = this.storageQueue.then(action, action);
    this.storageQueue = result.catch(() => {});
    return result;
  }
  async restore(): Promise<Session | null> {
    const epoch = this.generation;
    const value = await this.storage.read();
    let parsed: unknown;
    try { parsed = value ? JSON.parse(value) : null; } catch { parsed = null; }
    if (epoch !== this.generation) return this.session;
    if (isSession(parsed)) this.session = parsed;
    else if (value) await this.enqueueStorage(() => this.storage.clear());
    return this.session;
  }
  async setSession(value: Session) {
    if (!isSession(value)) throw new ApiError('The server returned an invalid session.');
    const epoch = ++this.generation;
    this.session = null;
    await this.enqueueStorage(() => this.storage.write(JSON.stringify(value)));
    if (epoch === this.generation) this.session = value;
  }
  async clearSession() {
    this.generation++;
    this.session = null;
    await this.enqueueStorage(() => this.storage.clear());
  }
  getSession() { return this.session; }

  private async send<T>(path: string, method: string, body: unknown, token?: string): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//')) throw new ApiError('Invalid API path.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await this.transport(`${this.baseUrl}${path}`, {
        method, credentials: 'omit', signal: controller.signal,
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      let json: Envelope<T> | undefined;
      try { json = await response.json(); } catch { /* HTML from a proxy is never shown to the user. */ }
      if (!response.ok || json?.success === false) {
        const message = response.status >= 500 ? 'The server is having trouble. Please try again.' : typeof json?.message === 'string' ? json.message : `Request failed (${response.status}).`;
        throw new ApiError(message, response.status);
      }
      if (!json || !Object.prototype.hasOwnProperty.call(json, 'data')) throw new ApiError('Unexpected response from the server.');
      return json.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(controller.signal.aborted ? 'The request timed out. Please try again.' : 'Could not reach LnkShrt. Check your connection and try again.');
    } finally { clearTimeout(timeout); }
  }
  publicRequest<T>(path: string, method = 'POST', body?: unknown) { return this.send<T>(path, method, body); }

  private async refresh(epoch: number) {
    if (!this.refreshing) {
      const refreshToken = this.session?.refreshToken;
      if (!refreshToken) throw new ApiError('Please sign in again.', 401);
      const task = (async () => {
        try {
          const session = await this.send<Session>('/auth/refresh-token', 'POST', { refreshToken });
          if (this.generation !== epoch) throw new ApiError('Your session has changed. Please try again.', 401);
          if (!isSession(session)) throw new ApiError('The server returned an invalid session.');
          await this.enqueueStorage(() => this.storage.write(JSON.stringify(session)));
          if (this.generation === epoch) this.session = session;
        } catch (error) {
          if (this.generation === epoch && error instanceof ApiError && [400, 401, 403].includes(error.status)) {
            await this.clearSession(); this.onAuthLost();
          }
          throw error;
        }
      })();
      this.refreshing = task;
      void task.finally(() => { if (this.refreshing === task) this.refreshing = null; }).catch(() => {});
    }
    await this.refreshing;
  }
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const epoch = this.generation;
    const token = this.session?.accessToken;
    if (!token) throw new ApiError('Please sign in to continue.', 401);
    try {
      const data = await this.send<T>(path, method, body, token);
      if (epoch !== this.generation) throw new ApiError('Your session has changed.', 401);
      return data;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401 || epoch !== this.generation) throw error;
      // A parallel request may already have rotated the tokens.
      if (this.session?.accessToken === token) await this.refresh(epoch);
      if (epoch !== this.generation || !this.session) throw new ApiError('Please sign in again.', 401);
      try {
        const result = await this.send<T>(path, method, body, this.session.accessToken);
        if (epoch !== this.generation) throw new ApiError('Your session has changed.', 401);
        return result;
      }
      catch (retryError) {
        if (retryError instanceof ApiError && retryError.status === 401 && epoch === this.generation) { await this.clearSession(); this.onAuthLost(); }
        throw retryError;
      }
    }
  }
}
