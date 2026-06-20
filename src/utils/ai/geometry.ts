export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Calcula el ángulo entre tres puntos (A, B, C) donde B es el vértice.
 * Inspirado en la lógica matemática de FitFusion.
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Utilidad de debouncing rápido para el contador de reps
 */
export function createDebouncer(delayMs: number) {
  let lastTime = 0;
  return () => {
    const now = Date.now();
    if (now - lastTime > delayMs) {
      lastTime = now;
      return true;
    }
    return false;
  };
}
