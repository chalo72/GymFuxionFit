import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'trainer' | 'receptionist';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gymfuxion_auth');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('gymfuxion_auth');
      }
    }
  }, []);

  const login = (role: UserRole) => {
    const mockUser: User = {
      id: '1',
      name: role === 'admin' ? 'Administrador Master' : role === 'trainer' ? 'Entrenador Pro' : 'Recepcion Fuxion',
      email: `${role}@gymfuxionfit.com`,
      role: role,
    };
    setUser(mockUser);
    localStorage.setItem('gymfuxion_auth', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gymfuxion_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
