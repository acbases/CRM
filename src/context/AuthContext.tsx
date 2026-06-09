import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 load session
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('user');
      setUser(data ? JSON.parse(data) : null);
      setLoading(false);
    };

    loadUser();
  }, []);

  // 🔐 login
  const login = async (data: any) => {
    const safeUser = data.user;
    await AsyncStorage.setItem('user', JSON.stringify(safeUser));
    setUser(safeUser);
  };

  // 🚪 logout
  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);