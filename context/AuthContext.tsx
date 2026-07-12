import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, logout as apiLogout, getStoredUser, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (u: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getStoredUser();
      if (stored) setUser(stored);
      setLoading(false);
    })();
  }, []);

  const login = async (srCode: string, password: string) => {
    const data = await apiLogin(srCode, password);
    setUser(data.user);
    setToken(data.token);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (u: User) => {
    setUser(u);
    await AsyncStorage.setItem('auth_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
