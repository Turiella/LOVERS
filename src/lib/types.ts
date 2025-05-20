
export type Gender = 'Hombre' | 'Mujer';
export type GenderPreference = 'Hombres' | 'Mujeres' | 'Ambos';
export type AgeRangeTuple = [number, number]; // e.g., [18, 27]
export type AgeRangeString = '18-27' | '28-37' | '38-47' | '48-57' | '58-67' | '68+';

export interface UserPreferences {
  genderPreference: GenderPreference;
  ageRange: AgeRangeString;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  photoUrl: string; // Original photo uploaded by user
  enhancedPhotoUrl?: string; // AI enhanced photo
  interests?: string;
  tags?: string[];
  preferences: UserPreferences;
  createdAt: string; // ISO string date
  hasLikedCurrentUser?: boolean; // Indica si este usuario de demostración ha "likeado" al usuario actual
  freeGalleryUrls?: string[];
  premiumGalleryUrls?: string[];
}

export interface UserLike {
  toUserId: string;    // ID del perfil al que se le dio like
  timestamp: string; // Fecha y hora del like
}

export interface ChatMessage {
  id: string;
  senderId: string; // ID del usuario que envió el mensaje
  text: string;
  timestamp: string; // ISO string date
}

