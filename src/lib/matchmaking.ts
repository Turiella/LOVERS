
import type { UserProfile, AgeRangeString, AgeRangeTuple, Gender, GenderPreference } from './types';

export function parseAgeRange(ageRangeString: AgeRangeString): AgeRangeTuple {
  if (ageRangeString === '68+') {
    return [68, 999]; // Effectively 68 and older
  }
  const parts = ageRangeString.split('-');
  return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
}

export function checkGenderMatch(userGender: Gender, preference: GenderPreference): boolean {
  if (preference === 'Ambos') return true;
  if (preference === 'Hombres' && userGender === 'Hombre') return true;
  if (preference === 'Mujeres' && userGender === 'Mujer') return true;
  return false;
}

export function checkAgeMatch(userAge: number, preferredAgeRange: AgeRangeString): boolean {
  const [minAge, maxAge] = parseAgeRange(preferredAgeRange);
  return userAge >= minAge && userAge <= maxAge;
}

export function findMatches(currentUser: UserProfile, allUsers: UserProfile[]): UserProfile[] {
  if (!currentUser) return [];

  const potentialMatches = allUsers.filter(otherUser => {
    if (otherUser.id === currentUser.id) return false; // Don't match with self

    // Check if otherUser matches currentUser's preferences
    const currentUserLikesOtherUser =
      checkGenderMatch(otherUser.gender, currentUser.preferences.genderPreference) &&
      checkAgeMatch(otherUser.age, currentUser.preferences.ageRange);

    if (!currentUserLikesOtherUser) return false;

    // Check if currentUser matches otherUser's preferences (mutual match)
    const otherUserLikesCurrentUser =
      checkGenderMatch(currentUser.gender, otherUser.preferences.genderPreference) &&
      checkAgeMatch(currentUser.age, otherUser.preferences.ageRange);
      
    return otherUserLikesCurrentUser;
  });

  return potentialMatches;
}

