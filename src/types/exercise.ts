export interface ExerciseDBItem {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
}

export interface WorkoutExercise extends ExerciseDBItem {
  sets: number;
  reps: number;
  rest: string; // e.g. "90s"
  intensity: number; // Percentage
  kcal: number;
}
