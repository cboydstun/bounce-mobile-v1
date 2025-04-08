import React, { createContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  apiRequest: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Subscribe to user changes
    const subscription = authService.user.subscribe(setUser);
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Memoize the functions so they don't change on every render
  const login = useCallback(
    (email: string, password: string) => authService.login(email, password),
    []
  );

  const logout = useCallback(() => authService.logout(), []);

  const apiRequest = useCallback(
    (endpoint: string, options?: RequestInit) => authService.apiRequest(endpoint, options),
    []
  );

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
