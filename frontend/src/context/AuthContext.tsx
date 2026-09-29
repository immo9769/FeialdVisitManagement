import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  employeeNo: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_EXEC' | 'SERVICE_ENG';
  gender: string;
  branch: string | null;
  branchId: number;
  department: string | null;
  designation: string | null;
  grade?: string | null;
  mobileNo?: string | null;
}

export interface MicrosoftAuthPayload {
  idToken?: string;
  accessToken?: string;
  email?: string;
  name?: string;
  azureAdOid?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithMicrosoft: (payload: MicrosoftAuthPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res: any = await api.post('/auth/login', { username, password });
      const { accessToken, token: fallbackToken, user: userData } = res;
      const validToken = accessToken || fallbackToken;
      setToken(validToken);
      setUser(userData);
      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem('logged_out');
    } finally {
      setLoading(false);
    }
  };

  const loginWithMicrosoft = async (payload: MicrosoftAuthPayload) => {
    setLoading(true);
    try {
      const res: any = await api.post('/auth/azure', payload);
      const { accessToken, token: fallbackToken, user: userData } = res;
      const validToken = accessToken || fallbackToken;
      setToken(validToken);
      setUser(userData);
      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem('logged_out');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('logged_out', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithMicrosoft,
        logout,
        isAuthenticated: !!token && !!user,
        loading,
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
