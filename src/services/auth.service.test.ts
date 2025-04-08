import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from './auth.service';

// Mock the Capacitor Preferences
vi.mock('@capacitor/preferences', () => {
  return {
    Preferences: {
      get: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock import.meta.env.DEV
vi.stubGlobal('import', {
  meta: {
    env: {
      DEV: true, // Set to true for testing with relative URLs
    },
  },
});

// Mock fetch
global.fetch = vi.fn();

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mocked fetch
    (global.fetch as any).mockReset();
  });

  describe('login', () => {
    it('should store tokens and user data on successful login', async () => {
      // Mock successful login response
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      const mockResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: mockUser,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      // Call login
      const result = await authService.login('test@example.com', 'password123');

      // Verify fetch was called with correct parameters
      // Using relative URL in dev mode
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mobile/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        }
      );

      // Verify tokens and user were stored
      const { Preferences } = await import('@capacitor/preferences');
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'accessToken', value: 'test-access-token' });
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'refreshToken', value: 'test-refresh-token' });
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'user', value: JSON.stringify(mockUser) });

      // Verify the returned user
      expect(result).toEqual(mockUser);
    });

    it('should throw an error on failed login', async () => {
      // Mock failed login response
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ error: 'Invalid credentials' }),
      });

      // Expect login to throw an error
      await expect(authService.login('test@example.com', 'wrong-password')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('logout', () => {
    it('should clear stored data and call logout endpoint', async () => {
      // Mock Preferences.get to return a refresh token
      const { Preferences } = await import('@capacitor/preferences');
      (Preferences.get as any).mockResolvedValueOnce({ value: 'test-refresh-token' });

      // Mock successful logout response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      // Call logout
      await authService.logout();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mobile/auth/logout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: 'test-refresh-token',
          }),
        }
      );

      // Verify tokens and user were removed
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'accessToken' });
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'refreshToken' });
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'user' });
    });
  });

  describe('refreshToken', () => {
    it('should update tokens on successful refresh', async () => {
      // Mock Preferences.get to return a refresh token
      const { Preferences } = await import('@capacitor/preferences');
      (Preferences.get as any).mockResolvedValueOnce({ value: 'test-refresh-token' });

      // Mock successful refresh response
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      // Call refreshToken
      const result = await authService.refreshToken();

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mobile/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: 'test-refresh-token',
          }),
        }
      );

      // Verify tokens were updated
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'accessToken', value: 'new-access-token' });
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'refreshToken', value: 'new-refresh-token' });

      // Verify the result is true
      expect(result).toBe(true);
    });

    it('should return false if no refresh token is available', async () => {
      // Mock Preferences.get to return null (no refresh token)
      const { Preferences } = await import('@capacitor/preferences');
      (Preferences.get as any).mockResolvedValueOnce({ value: null });

      // Call refreshToken
      const result = await authService.refreshToken();

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();

      // Verify the result is false
      expect(result).toBe(false);
    });
  });

  describe('apiRequest', () => {
    it('should add authorization header to requests', async () => {
      // Mock Preferences.get to return an access token
      const { Preferences } = await import('@capacitor/preferences');
      (Preferences.get as any).mockResolvedValueOnce({ value: 'test-access-token' });

      // Mock successful API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      // Call apiRequest
      await authService.apiRequest('/api/mobile/protected-data');

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mobile/protected-data',
        {
          headers: {
            Authorization: 'Bearer test-access-token',
          },
        }
      );
    });

    it('should attempt token refresh on 401 response', async () => {
      // Mock Preferences.get to return tokens
      const { Preferences } = await import('@capacitor/preferences');
      (Preferences.get as any)
        .mockResolvedValueOnce({ value: 'old-access-token' }) // First call for initial request
        .mockResolvedValueOnce({ value: 'old-refresh-token' }) // Second call for refresh
        .mockResolvedValueOnce({ value: 'new-access-token' }); // Third call for retry

      // Mock 401 response followed by successful response after refresh
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockResolvedValueOnce({
          // Token refresh response
          ok: true,
          json: vi.fn().mockResolvedValueOnce({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          }),
        })
        .mockResolvedValueOnce({
          // Retry response
          ok: true,
          status: 200,
        });

      // Call apiRequest
      await authService.apiRequest('/api/mobile/protected-data');

      // Verify fetch was called 3 times (initial request, token refresh, retry)
      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Verify the retry request used the new token
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/mobile/protected-data',
        {
          headers: {
            Authorization: 'Bearer new-access-token',
          },
        }
      );
    });
  });
});
