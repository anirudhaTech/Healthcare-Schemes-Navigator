import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { full_name: string; email: string; mobile?: string; password: string }) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isGuest, setIsGuest] = useState<boolean>(localStorage.getItem('is_guest') === 'true');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const u = await api.auth.me();
          setUser(u);
          setIsGuest(false);
        } catch (err) {
          console.error('Session expired or invalid token');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      localStorage.setItem('auth_token', res.access_token);
      localStorage.removeItem('is_guest');
      setToken(res.access_token);
      setIsGuest(false);
      const u = await api.auth.me();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { full_name: string; email: string; mobile?: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('auth_token', res.access_token);
      localStorage.removeItem('is_guest');
      setToken(res.access_token);
      setIsGuest(false);
      const u = await api.auth.me();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('is_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    localStorage.removeItem('auth_token');
    localStorage.setItem('is_guest', 'true');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isGuest,
        isLoading,
        login,
        register,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
