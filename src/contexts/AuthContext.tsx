import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'trainer' | 'receptionist';

// Sesión persistente
const SESSION_MAX_MS = 99999 * 24 * 60 * 60 * 1000; 

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  loginAt?: number; // timestamp de login para expiración
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('gymfuxion_auth');
      if (savedUser) {
        const parsed: User = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error inicializando AuthContext:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Sincronizar user con localStorage cada vez que cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('gymfuxion_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('gymfuxion_auth');
    }
  }, [user]);

  const login = (role: UserRole) => {
    const mockUser: User = {
      id: '1',
      name: role === 'admin' ? 'Administrador Master' : role === 'trainer' ? 'Entrenador Pro' : 'Recepcion Fuxion',
      email: `${role}@gymfuxionfit.com`,
      role: role,
      loginAt: Date.now(),
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gymfuxion_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
