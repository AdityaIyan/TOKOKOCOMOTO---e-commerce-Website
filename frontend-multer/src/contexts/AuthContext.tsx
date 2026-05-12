import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role?: string, email?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('bukan akun anda');
      }
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    const data = await response.json();

    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (username: string, password: string, role?: string, email?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role, email }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }

    const data = await response.json();

    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}