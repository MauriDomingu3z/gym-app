import type { WeightUnit } from '../../core/models/user.model';

const KG_PER_LB = 0.45359237;

// La API siempre persiste y devuelve el peso en kg (unidad canónica); estos
// helpers solo convierten para mostrar/cargar en la unidad que eligió el usuario.
export function kgToDisplayValue(weightKg: number, unit: WeightUnit): number {
  const value = unit === 'lb' ? weightKg / KG_PER_LB : weightKg;
  return Math.round(value * 10) / 10;
}

export function displayValueToKg(value: number, unit: WeightUnit): number {
  const kg = unit === 'lb' ? value * KG_PER_LB : value;
  return Math.round(kg * 100) / 100;
}

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  return `${kgToDisplayValue(weightKg, unit)} ${unit}`;
}
