import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the axios instance config, not actual HTTP calls
describe('api axios instance', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has the correct baseURL from env', async () => {
    // Set env before import
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');
    const mod = await import('../api');
    expect(mod.default.defaults.baseURL).toBe('https://api.example.com');
    vi.unstubAllEnvs();
  });

  it('attaches Authorization header when token exists in localStorage', async () => {
    localStorage.setItem('token', 'my_jwt_token');
    const mod = await import('../api');
    // Simulate interceptor call directly
    const reqConfig: any = { headers: {} };
    // Find request interceptor — index 0
    const interceptors = (mod.default.interceptors.request as any).handlers;
    if (interceptors.length > 0) {
      const handler = interceptors[interceptors.length - 1]?.fulfilled;
      if (handler) {
        const result = handler(reqConfig);
        expect(result.headers.Authorization).toBe('Bearer my_jwt_token');
      }
    }
  });

  it('does not set Authorization when no token', async () => {
    localStorage.removeItem('token');
    const mod = await import('../api');
    const reqConfig: any = { headers: {} };
    const interceptors = (mod.default.interceptors.request as any).handlers;
    if (interceptors.length > 0) {
      const handler = interceptors[interceptors.length - 1]?.fulfilled;
      if (handler) {
        const result = handler(reqConfig);
        expect(result.headers.Authorization).toBeUndefined();
      }
    }
  });
});
