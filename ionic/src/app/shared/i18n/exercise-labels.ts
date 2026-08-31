// Traducción de presentación (no de negocio): la API sigue devolviendo y
// filtrando por los valores en inglés del dataset (@bryllim/workout-guide);
// esto solo traduce lo que se muestra en pantalla. Conjunto cerrado y chico
// (41 valores) — no requiere persistencia ni un servicio de traducción.

export const MUSCLE_LABELS: Record<string, string> = {
  Adductors: 'Aductores',
  Back: 'Espalda',
  Biceps: 'Bíceps',
  Calves: 'Gemelos',
  Chest: 'Pecho',
  Core: 'Core',
  Forearms: 'Antebrazos',
  Glutes: 'Glúteos',
  Hamstrings: 'Isquiotibiales',
  Hips: 'Cadera',
  Lats: 'Dorsales',
  Legs: 'Piernas',
  'Lower Back': 'Zona lumbar',
  Mobility: 'Movilidad',
  'Posterior Chain': 'Cadena posterior',
  Quads: 'Cuádriceps',
  'Rear Delts': 'Deltoides posterior',
  Shoulders: 'Hombros',
  Triceps: 'Tríceps',
  'Upper Back': 'Espalda alta',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  Barbell: 'Barra',
  Bench: 'Banco',
  Bodyweight: 'Peso corporal',
  Box: 'Cajón',
  Cable: 'Polea',
  Cardio: 'Cardio',
  Chair: 'Silla',
  Doorway: 'Marco de puerta',
  Dumbbell: 'Mancuerna',
  Kettlebell: 'Kettlebell',
  Machine: 'Máquina',
  Plate: 'Disco',
  'Pull-up Bar': 'Barra de dominadas',
  'Resistance Band': 'Banda elástica',
  'Stability Ball': 'Pelota suiza',
  Towel: 'Toalla',
  Wall: 'Pared',
};

export const TYPE_LABELS: Record<string, string> = {
  weight_reps: 'Con peso y repeticiones',
  bodyweight_reps: 'Peso corporal y repeticiones',
  assisted_bodyweight: 'Peso corporal asistido',
  duration: 'Duración',
  distance_duration: 'Distancia y duración',
};

export function translateLabel(dictionary: Record<string, string>, value: string): string {
  return dictionary[value] ?? value;
}
