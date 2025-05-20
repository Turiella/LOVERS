
import type { Gender, GenderPreference, AgeRangeString } from './types';

export const GENDER_OPTIONS: Gender[] = ['Hombre', 'Mujer'];
export const GENDER_PREFERENCE_OPTIONS: GenderPreference[] = ['Hombres', 'Mujeres', 'Ambos'];
export const AGE_RANGE_OPTIONS: AgeRangeString[] = [
  '18-27',
  '28-37',
  '38-47',
  '48-57',
  '58-67',
  '68+',
];

export const MIN_AGE = 18;
export const MAX_AGE = 99;

// DEFAULT_USER_ID is no longer needed as Firebase UID will be used.
