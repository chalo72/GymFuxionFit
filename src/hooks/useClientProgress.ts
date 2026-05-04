import { useState, useEffect } from 'react';
import { useGymData } from './useGymData';

export interface WorkoutSession {
  id?: string;
  date: string;
  exercises: number;
  duration: number;
  intensity: number;
  calories: number;
  completed: boolean;
  program?: string;
  totalVolume?: number;
}

export interface NutritionDay {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  adherence: number;
}

export function useClientProgress(userId?: string) {
  const { members, updateMemberStatus } = useGymData();
  
  // Si no se pasa userId, intentamos usar el primer miembro activo o un mock
  const member = userId ? members.find(m => m.id === userId) : (members.length > 0 ? members[0] : null);

  const [clientData, setClientData] = useState({
    name: 'Cargando...',
    memberSince: '...',
    currentGoal: '...',
    status: '...',
  });

  useEffect(() => {
    if (member) {
      setClientData({
        name: member.name,
        memberSince: member.joined ? new Date(member.joined).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'Enero 2026',
        currentGoal: member.goal || member.objective || 'Mejora general',
        status: member.status === 'active' ? 'En Camino ✓' : 'Inactivo',
      });
    } else {
      setClientData({
        name: 'Alex Guerrero (Demo)',
        memberSince: 'Enero 2026',
        currentGoal: 'HYROX Sub-60',
        status: 'En Camino ✓',
      });
    }
  }, [member]);

  // Histórico de entrenamientos (Ahora conectado a la base de datos híbrida de la App)
  const workoutHistory: WorkoutSession[] = member?.workoutHistory || [
    { id: '1', date: '29 Apr', exercises: 6, duration: 75, intensity: 88, calories: 520, completed: true, program: 'Fuerza', totalVolume: 12500 },
    { id: '2', date: '28 Apr', exercises: 5, duration: 60, intensity: 82, calories: 410, completed: true, program: 'Cardio', totalVolume: 0 },
    { id: '3', date: '27 Apr', exercises: 0, duration: 0, intensity: 0, calories: 0, completed: false, program: 'Descanso Activo', totalVolume: 0 },
    { id: '4', date: '26 Apr', exercises: 7, duration: 90, intensity: 92, calories: 680, completed: true, program: 'Fuerza', totalVolume: 15200 },
    { id: '5', date: '25 Apr', exercises: 5, duration: 65, intensity: 80, calories: 420, completed: true, program: 'HIIT', totalVolume: 8500 },
    { id: '6', date: '24 Apr', exercises: 6, duration: 70, intensity: 85, calories: 480, completed: true, program: 'Fuerza', totalVolume: 11000 },
    { id: '7', date: '23 Apr', exercises: 6, duration: 75, intensity: 90, calories: 560, completed: true, program: 'Metcon', totalVolume: 9000 },
  ];

  // Histórico de nutrición (Conectado a la base de datos)
  const nutritionHistory: NutritionDay[] = member?.nutritionHistory || [
    { date: 'Lun', calories: 2150, protein: 180, carbs: 240, fats: 65, adherence: 92 },
    { date: 'Mar', calories: 2200, protein: 185, carbs: 250, fats: 68, adherence: 95 },
    { date: 'Mié', calories: 2080, protein: 175, carbs: 230, fats: 62, adherence: 88 },
    { date: 'Jue', calories: 2240, protein: 190, carbs: 260, fats: 70, adherence: 96 },
    { date: 'Vie', calories: 2160, protein: 182, carbs: 245, fats: 67, adherence: 93 },
    { date: 'Sab', calories: 2300, protein: 195, carbs: 270, fats: 72, adherence: 98 },
    { date: 'Dom', calories: 2120, protein: 178, carbs: 235, fats: 64, adherence: 90 },
  ];

  // Métricas consolidadas
  const metrics = {
    totalSessions: member?.visits || 47,
    totalHours: 52.5,
    currentStreak: member?.streak || 12,
    weeklyCompletionRate: 86,
    nutritionAdherence: 92,
    avgIntensity: 86,
    totalCalories: 18550,
    projectedProgress: member?.progress || 78,
  };

  // ── Datos para NutritionProfile ──
  const nutritionData = {
    today: {
      calories: { current: 1640, target: 2200, pct: 74 },
      protein: { current: 142, target: 180, pct: 79 },
      carbs: { current: 210, target: 250, pct: 84 },
      fats: { current: 48, target: 65, pct: 74 },
    },
    weeklyTrend: nutritionHistory.map(n => ({ day: n.date, adherence: n.adherence, calories: n.calories }))
  };

  const todaysMeals = member?.todaysMeals || [
    { id: '1', date: 'Hoy 8:30 AM', meal: 'Desayuno', items: ['Oatmeal (50g)', 'Huevos (3)', 'Plátano (1)', 'Almendras (20g)'], calories: 480, protein: 18, carbs: 68, fats: 14, logged: true },
    { id: '2', date: 'Hoy 11:00 AM', meal: 'Pre-Entreno', items: ['Whey Protein (30g)', 'Banana (1)'], calories: 310, protein: 30, carbs: 42, fats: 2, logged: true },
    { id: '3', date: 'Hoy 2:00 PM', meal: 'Almuerzo', items: ['Pechuga de Pollo (200g)', 'Arroz blanco (150g)', 'Brócoli (150g)', 'Aceite (5ml)'], calories: 620, protein: 52, carbs: 84, fats: 12, logged: true },
    { id: '4', date: 'Hoy 8:00 PM', meal: 'Cena (Pendiente)', items: ['Salmón (150g)', 'Papa (200g)', 'Espinaca (100g)'], calories: 450, protein: 42, carbs: 56, fats: 12, logged: false }
  ];

  const plans = member?.plans || [
    { id: '1', name: 'HYROX Elite Cut', goal: 'Pérdida de grasa (-2kg/mes)', targetCalories: 2200, targetMacros: { protein: 180, carbs: 250, fats: 65 }, duration: 12, startDate: 'Enero 2026', active: true },
    { id: '2', name: 'Ganancia Muscular Anterior', goal: 'Hipertrofia (Completado)', targetCalories: 2600, targetMacros: { protein: 200, carbs: 320, fats: 80 }, duration: 10, startDate: 'Octubre 2025', active: false }
  ];
  
  const activePlan = plans[0];

  // ── Datos para TrainingDashboard2 ──
  const activeProgram = member?.activeProgram || {
    id: '1', name: 'HYROX Elite Protocol', goal: 'Rendimiento completo en prueba HYROX', duration: 16, weeklyFrequency: 5, startDate: 'Enero 2026', active: true, totalSessions: 80, sessionsCompleted: 47
  };

  const sessionHistory = member?.sessionHistory || [
    { id: '1', date: '29 Abr 2026', program: 'Lower Body Power', duration: 75, exercises: 6, totalVolume: 18450, avgIntensity: 88, calories: 520, exercises_list: [{ name: 'Back Squat', sets: 4, reps: 6, weight: 140 }, { name: 'Deadlift', sets: 3, reps: 5, weight: 185 }, { name: 'Leg Press', sets: 3, reps: 10, weight: 280 }], completed: true, notes: 'Excelente sesión. +3kg en Back Squat.' },
    { id: '2', date: '28 Abr 2026', program: 'Upper Body Hypertrophy', duration: 60, exercises: 5, totalVolume: 14200, avgIntensity: 82, calories: 410, exercises_list: [{ name: 'Bench Press', sets: 4, reps: 8, weight: 105 }], completed: true },
    { id: '3', date: '27 Abr 2026', program: 'Rest Day', duration: 0, exercises: 0, totalVolume: 0, avgIntensity: 0, calories: 0, exercises_list: [], completed: true, notes: 'Recuperación activa' }
  ];

  const weeklyMetrics = member?.weeklyMetrics || [
    { day: 'Lun', volume: 18450, intensity: 88, sessions: 1, calories: 520 },
    { day: 'Mar', volume: 14200, intensity: 82, sessions: 1, calories: 410 },
    { day: 'Mié', volume: 0, intensity: 0, sessions: 0, calories: 0 },
    { day: 'Jue', volume: 22100, intensity: 92, sessions: 1, calories: 680 },
    { day: 'Vie', volume: 16800, intensity: 85, sessions: 1, calories: 480 },
    { day: 'Sab', volume: 19200, intensity: 87, sessions: 1, calories: 560 },
    { day: 'Dom', volume: 0, intensity: 0, sessions: 0, calories: 0 },
  ];

  const trainingMetrics = member?.trainingMetrics || {
    thisWeek: { sessions: 5, totalHours: 22.5, avgIntensity: 87, totalCalories: 2650, totalVolume: 91850, completionRate: 100 },
    allTime: { totalSessions: 47, totalHours: 52.5, avgIntensity: 86, streak: 12, personalRecords: 3 }
  };

  return {
    clientData,
    workoutHistory,
    nutritionHistory,
    metrics,
    
    // Exports para otros dashboards
    nutritionData, todaysMeals, plans, activePlan,
    activeProgram, sessionHistory, weeklyMetrics, trainingMetrics,
    
    // Función para actualizar datos reales en la BD (Firebase/Supabase)
    updateClientProgress: async (updates: any) => {
      if (member) {
        await updateMemberStatus(member.id, updates);
      }
    },

    isLoading: members.length === 0
  };
}
