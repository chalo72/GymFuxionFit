import { WorkoutExercise } from '../types/exercise';

// Esta función simularía la llamada a RapidAPI (ExerciseDB)
// Actualmente devuelve nuestra "Semilla Visual" de demostración.
export const fetchTodaysWorkout = async (): Promise<WorkoutExercise[]> => {
  // Simulando latencia de red
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: "ex_001",
      name: "Sentadilla Frontal",
      bodyPart: "Piernas",
      target: "Cuádriceps",
      equipment: "Barra Olímpica",
      secondaryMuscles: ["Glúteos", "Core", "Isquiotibiales"],
      instructions: [
        "Sostén la barra sobre tus hombros delanteros.",
        "Mantén el pecho arriba y el core apretado.",
        "Desciende hasta que tus muslos estén paralelos al suelo.",
        "Empuja con los talones para volver a la posición inicial."
      ],
      gifUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800",
      sets: 4,
      reps: 10,
      rest: "90s",
      intensity: 85,
      kcal: 95
    },
    {
      id: "ex_002",
      name: "Press de Banca Plano",
      bodyPart: "Pecho",
      target: "Pectoral Mayor",
      equipment: "Barra Olímpica",
      secondaryMuscles: ["Tríceps", "Deltoides Anterior"],
      instructions: [
        "Acuéstate en el banco con los pies plantados en el suelo.",
        "Agarra la barra un poco más ancho que los hombros.",
        "Baja la barra lentamente hacia el centro de tu pecho.",
        "Empuja la barra explosivamente hacia arriba."
      ],
      gifUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
      sets: 3,
      reps: 12,
      rest: "60s",
      intensity: 78,
      kcal: 72
    },
    {
      id: "ex_003",
      name: "Plancha Abdominal",
      bodyPart: "Core",
      target: "Abdomen",
      equipment: "Peso Corporal",
      secondaryMuscles: ["Hombros", "Lumbares"],
      instructions: [
        "Apóyate sobre tus antebrazos y las puntas de los pies.",
        "Mantén el cuerpo en una línea recta desde la cabeza hasta los talones.",
        "Aprieta el core y los glúteos intensamente.",
        "Sostén la posición sin dejar caer la cadera."
      ],
      gifUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80&w=800",
      sets: 3,
      reps: 15,
      rest: "60s",
      intensity: 65,
      kcal: 68
    },
    {
      id: "ex_004",
      name: "Salto Pliométrico",
      bodyPart: "Cardio",
      target: "Piernas Completas",
      equipment: "Cajón Pliométrico",
      secondaryMuscles: ["Pantorrillas", "Glúteos"],
      instructions: [
        "Párate frente al cajón con los pies al ancho de los hombros.",
        "Flexiona ligeramente las rodillas e impúlsate con los brazos.",
        "Salta explosivamente y aterriza suavemente sobre el cajón.",
        "Baja con cuidado dando un paso atrás y repite."
      ],
      gifUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800",
      sets: 4,
      reps: 8,
      rest: "90s",
      intensity: 92,
      kcal: 110
    }
  ];
};
