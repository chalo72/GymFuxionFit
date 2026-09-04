export type UserRole = 'admin' | 'trainer' | 'receptionist' | 'client' | 'athlete';

export const ACCESO_DIRECTO = {
  clave: 'fuxion26',
  cuentas: [
    { role: 'admin' as UserRole, name: 'Gerencia', email: 'gerencia@gym.local' },
    { role: 'trainer' as UserRole, name: 'Entrenador', email: 'entrenador@gym.local' },
    { role: 'receptionist' as UserRole, name: 'Recepción', email: 'recepcion@gym.local' },
    { role: 'client' as UserRole, name: 'Socio', email: 'socio@gym.local' },
  ],
};

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = 'gymfuxion_users';

export function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function hashPassword(password: string): Promise<string> {
  const payload = `gff:${password}`;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    let h = 2166136261;
    for (let i = 0; i < payload.length; i++) {
      h ^= payload.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `fb_${(h >>> 0).toString(16)}`;
  }
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function upsertUser(params: {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}): Promise<string | null> {
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  if (!name || !email || params.password.length < 6) {
    return Promise.resolve('Nombre, correo y contraseña de al menos 6 caracteres.');
  }
  return hashPassword(params.password).then((passwordHash) => {
    const users = loadUsers();
    const i = users.findIndex((u) => u.email === email);
    if (i >= 0) {
      users[i] = { ...users[i], name, role: params.role, passwordHash };
    } else {
      users.push({
        id: newId(),
        name,
        email,
        role: params.role,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
    }
    saveUsers(users);
    return null;
  });
}

export function mapStaffRole(raw?: string): UserRole {
  const t = (raw || '').toLowerCase();
  if (t.includes('entren') || t.includes('coach') || t.includes('trainer')) return 'trainer';
  if (t.includes('recep') || t.includes('front') || t.includes('caja')) return 'receptionist';
  if (t.includes('geren') || t.includes('admin')) return 'admin';
  return 'admin';
}
