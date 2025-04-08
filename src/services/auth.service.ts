import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { proxyService } from './proxy.service';

interface User {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private _user = new BehaviorSubject<User | null>(null);

  constructor() {
    this.init();
  }

  async init() {
    // Load stored user on initialization
    await this.loadStoredUser();
  }

  async loadStoredUser() {
    try {
      const result = await Preferences.get({ key: 'user' });
      const value = result?.value;
      if (value) {
        this._user.next(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading stored user details:', 
        error instanceof Error ? 
        { message: error.message, name: error.name, stack: error.stack } : 
        error
      );
    }
  }

  get user(): Observable<User | null> {
    return this._user.asObservable();
  }

  get isAuthenticated(): boolean {
    return this._user.value !== null;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: login called with email:', email);
      
      // Use proxy service to avoid CORS issues
      const response = await proxyService.post('/api/mobile/auth/login', {
        email,
        password
      });

      console.log('AuthService: login response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('AuthService: login failed:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('AuthService: login successful, received data:', data);

      // Store tokens and user data
      console.log('AuthService: storing tokens and user data');
      await Preferences.set({ key: 'accessToken', value: data.accessToken });
      await Preferences.set({ key: 'refreshToken', value: data.refreshToken });
      await Preferences.set({ key: 'user', value: JSON.stringify(data.user) });

      console.log('AuthService: updating user state');
      this._user.next(data.user);
      
      console.log('AuthService: login complete, returning user');
      return data.user;
    } catch (error) {
      console.error('AuthService: login error details:', 
        error instanceof Error ? 
        { message: error.message, name: error.name, stack: error.stack } : 
        error
      );
      throw error;
    }
  }

  async logout() {
    try {
      // First, update the user state to null to prevent any further authenticated requests
      this._user.next(null);
      
      // Then clear stored data
      await Preferences.remove({ key: 'accessToken' });
      await Preferences.remove({ key: 'refreshToken' });
      await Preferences.remove({ key: 'user' });
      
      // Get the refresh token (if it exists in memory)
      const result = await Preferences.get({ key: 'refreshToken' });
      const refreshToken = result?.value;

      // Only try to call the logout endpoint if we have a refresh token
      if (refreshToken) {
        try {
          console.log('AuthService: logging out with refresh token');
          
          // Use proxy service to avoid CORS issues
          await proxyService.post('/api/mobile/auth/logout', { refreshToken });
        } catch (logoutError) {
          // Ignore errors from the logout endpoint
          console.error('Logout API error details:', 
            logoutError instanceof Error ? 
            { message: logoutError.message, name: logoutError.name, stack: logoutError.stack } : 
            logoutError
          );
        }
      }
    } catch (error) {
      console.error('Logout error details:', 
        error instanceof Error ? 
        { message: error.message, name: error.name, stack: error.stack } : 
        error
      );
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const result = await Preferences.get({ key: 'refreshToken' });
      const refreshToken = result?.value;
      if (!refreshToken) {
        return false;
      }

      console.log('AuthService: refreshing token');
      
      // Use proxy service to avoid CORS issues
      const response = await proxyService.post('/api/mobile/auth/refresh', { refreshToken });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Store new tokens
      await Preferences.set({ key: 'accessToken', value: data.accessToken });
      await Preferences.set({ key: 'refreshToken', value: data.refreshToken });

      return true;
    } catch (error) {
      console.error('Token refresh error details:', 
        error instanceof Error ? 
        { message: error.message, name: error.name, stack: error.stack } : 
        error
      );
      return false;
    }
  }

  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const result = await Preferences.get({ key: 'accessToken' });
      const accessToken = result?.value || '';

      // Set auth header
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      };

      console.log('AuthService: making API request to:', endpoint);
      
      // Make request using proxy service
      let response = await proxyService.sendRequest(endpoint, {
        ...options,
        headers
      });

      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshToken();

        if (refreshed) {
          // Retry with new token
          const newResult = await Preferences.get({ key: 'accessToken' });
          const newToken = newResult?.value || '';
          headers['Authorization'] = `Bearer ${newToken}`;

          console.log('AuthService: retrying request with new token');
          response = await proxyService.sendRequest(endpoint, {
            ...options,
            headers
          });
        } else {
          // If refresh fails, logout
          this.logout();
          throw new Error('Session expired');
        }
      }

      return response;
    } catch (error) {
      console.error('API request error details:', 
        error instanceof Error ? 
        { message: error.message, name: error.name, stack: error.stack } : 
        error
      );
      throw error;
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
