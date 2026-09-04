import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loadUsers,
  saveUsers,
  hashPassword,
  upsertUser,
  ACCESO_DIRECTO,
  type StoredUser,
  type UserRole,
} from '../lib/localUsers';

export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  loginAt?: number;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasLocalUsers: boolean;
  registerFirstAdmin: (name: string, email: string, password: string) => Promise<string | null>;
  loginWithPassword: (email: string, password: string) => Promise<{ error: string | null; role?: UserRole }>;
  loginAsStaff: (params: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tempPassword?: string;
  }, password: string) => Promise<string | null>;
  upsertAccount: (params: {
    name: string;
    email: string;
    role: UserRole;
    password: string;
  }) => Promise<string | null>;
  accesoDirecto: (role: UserRole) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toSession(u: StoredUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    loginAt: Date.now(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('gymfuxion_auth');
      if (savedUser) {
        const parsed: User = JSON.parse(savedUser);
        if (parsed?.id && parsed?.role && parsed?.email) return parsed;
      }
    } catch (e) {
      console.error('Error inicializando AuthContext:', e);
    }
    return null;
  });

  const [hasLocalUsers, setHasLocalUsers] = useState(() => loadUsers().length > 0);
  const [loading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('gymfuxion_auth', JSON.stringify(user));
    else localStorage.removeItem('gymfuxion_auth');
  }, [user]);

  const registerFirstAdmin = async (name: string, email: string, password: string) => {
    if (loadUsers().length > 0) return 'Ya existe una cuenta. Inicia sesión.';
    const trimmed = email.trim().toLowerCase();
    if (!name.trim() || !trimmed || password.length < 6) {
      return 'Nombre, correo y contraseña de al menos 6 caracteres.';
    }
    const userRec: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: trimmed,
      role: 'admin',
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    saveUsers([userRec]);
    setHasLocalUsers(true);
    setUser(toSession(userRec));
    return null;
  };

  const loginWithPassword = async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    const users = loadUsers();
    const found = users.find((u) => u.email === trimmed);
    if (!found) return { error: 'No hay una cuenta con ese correo.' };
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) return { error: 'Contraseña incorrecta.' };
    setUser(toSession(found));
    return { error: null, role: found.role };
  };

  const loginAsStaff = async (
    params: { id: string; name: string; email: string; role: UserRole; tempPassword?: string },
    password: string
  ) => {
    if (!params.tempPassword) return 'Este colaborador no tiene clave asignada.';
    if (params.tempPassword !== password) return 'Contraseña incorrecta.';
    setUser({
      id: params.id,
      name: params.name,
      email: params.email,
      role: params.role,
      loginAt: Date.now(),
    });
    return null;
  };

  const upsertAccount = async (params: {
    name: string;
    email: string;
    role: UserRole;
    password: string;
  }) => {
    const err = await upsertUser(params);
    if (!err) setHasLocalUsers(true);
    return err;
  };

  const accesoDirecto = async (role: UserRole) => {
    const cuenta = ACCESO_DIRECTO.cuentas.find((c) => c.role === role);
    if (!cuenta) return 'Rol no disponible.';
    const err = await upsertUser({
      name: cuenta.name,
      email: cuenta.email,
      role: cuenta.role,
      password: ACCESO_DIRECTO.clave,
    });
    if (err) return err;
    setHasLocalUsers(true);
    const found = loadUsers().find((u) => u.email === cuenta.email);
    if (!found) return 'No se pudo crear la sesión.';
    setUser(toSession(found));
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gymfuxion_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        isAuthenticated: !!user,
        loading,
        hasLocalUsers,
        registerFirstAdmin,
        loginWithPassword,
        loginAsStaff,
        upsertAccount,
        accesoDirecto,
      }}
    >
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
