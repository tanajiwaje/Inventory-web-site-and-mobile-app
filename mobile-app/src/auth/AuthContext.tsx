import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, login as loginApi, register as registerApi, updateMe as updateMeApi } from '../services/api';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  supplierId?: string;
  customerId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const me = await getMe(storedToken);
          setUser(me);
          await AsyncStorage.setItem('user', JSON.stringify(me));
        } catch {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      }
      setReady(true);
    };
    void load();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginApi(email, password);
    setToken(result.token);
    setUser(result.user);
    await AsyncStorage.setItem('token', result.token);
    await AsyncStorage.setItem('user', JSON.stringify(result.user));
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
  }) => {
    await registerApi(payload);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    address?: string;
    companyName?: string;
    gstNumber?: string;
  }) => {
    if (!token) return;
    const updated = await updateMeApi(token, payload);
    setUser(updated);
    await AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout, updateProfile }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
