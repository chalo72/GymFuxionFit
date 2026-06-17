export interface Transaction {
  id: string | number; date: string; time: string; description: string;
  category: string; type: 'income' | 'expense'; amount: number; method: string; client?: string;
  evidenceUrl?: string;
  goalId?: string;
  hash?: string;
}

export interface GymAsset {
  id: string;
  name: string;
  category: 'machine' | 'free_weight' | 'accessory' | 'tool';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DEFECTIVE' | 'ORDERED';
  lastMaintenance: string;
  nextMaintenance: string;
  health: number;
  specs: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'apparel' | 'other';
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  category: 'expansion' | 'maintenance' | 'savings' | 'marketing' | 'payroll';
}

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  category: 'rent' | 'utilities' | 'payroll' | 'services' | 'other';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string;
  email: string;
  tempPassword?: string;
  lastPayment?: string;
  status: 'active' | 'inactive';
  payPeriod?: 'complete' | 'q1' | 'q2';
  advances?: number; // Anticipos pendientes a descontar en próximo pago
}

export interface StaffLoan {
  id: string;
  staffId: string;
  staffName: string;
  total: number;       // Monto total del préstamo
  remaining: number;   // Saldo pendiente
  installment: number; // Cuota por período
  date: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  status: 'active' | 'expiring' | 'expired' | 'suspended';
  expiryDate: string;
  debt: number;
  lastVisit: string;
  plan: string;
  phone?: string;
  email?: string;
  color?: string;
  height?: number;
  weight?: number;
  payMethod?: string;
  trainer?: string;
  visits?: number;
  joined?: string;
  nextPayment?: string;
  expiry?: string;
  emergency?: string;
  emergencyPhone?: string;
  address?: string;
  notes?: string;
  objective?: string;
  injuries?: string | string[];
  nutrition?: string;
  emergencyContact?: string;
  bodyFat?: number;
  streak?: number;
  alerts?: string[];
  goal?: string;
  suspendedReason?: string;
  suspendedDate?: string;
  progress?: number;
  biometricStatus?: 'pending' | 'completed';
  lastScan?: string;
  mobilityAnkle?: string;
  mobilityHip?: string;
  mobilityThoracic?: string;
  mobilityShoulders?: string;
  coreStability?: string;
  bracingAbility?: string;
  posturalCompensations?: string;
  clinicalHistory?: string;
  femurLength?: string;
  armLength?: string;
  techniqueNotes?: string;
  trainingLogs?: { date: string; session: string; intensity: number; notes: string }[];
  workoutHistory?: any[];
  nutritionHistory?: any[];
  plans?: any[];
  todaysMeals?: any[];
  activeProgram?: any;
  sessionHistory?: any[];
  weeklyMetrics?: any[];
  trainingMetrics?: any;
}
