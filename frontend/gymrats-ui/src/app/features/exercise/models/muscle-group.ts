export const MUSCLE_GROUPS = [
  { value: 'CHEST', label: 'Brust' },
  { value: 'BACK', label: 'Rücken' },
  { value: 'SHOULDERS', label: 'Schultern' },
  { value: 'BICEPS', label: 'Bizeps' },
  { value: 'TRICEPS', label: 'Trizeps' },
  { value: 'LEGS', label: 'Beine' },
  { value: 'ABS', label: 'Bauch' },
  { value: 'CALVES', label: 'Waden' },
  { value: 'OTHER', label: 'Sonstiges' },
] as const;

export type MuscleGroup =
  typeof MUSCLE_GROUPS[number]['value'];