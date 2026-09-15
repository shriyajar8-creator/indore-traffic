import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('indore_token'));

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await ApiService.login(email, pass);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('indore_token', data.token);
  };

  const quickLogin = async (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@indoretraffic.demo', pass: 'Admin@123' },
      TRAFFIC_POLICE: { email: 'police@indoretraffic.demo', pass: 'Police@123' },
      ROAD_DEPARTMENT: { email: 'roads@indoretraffic.demo', pass: 'Roads@123' },
      EMERGENCY_RESPONSE: { email: 'emergency@indoretraffic.demo', pass: 'Emergency@123' },
      CIVILIAN: { email: 'user@indoretraffic.demo', pass: 'User@123' }
    };
    const c = creds[role];
    if (c) {
      await login(c.email, c.pass);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('indore_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      quickLogin,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'TRAFFIC_POLICE' || user?.role === 'ROAD_DEPARTMENT' || user?.role === 'EMERGENCY_RESPONSE'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
