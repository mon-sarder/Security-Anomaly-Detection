import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import authService from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = authService.getToken();
    const storedUser = authService.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(username, password);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string, email: string): Promise<void> => {
    try {
      await authService.register(username, password, email);
      // After registration, automatically log in
      await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};