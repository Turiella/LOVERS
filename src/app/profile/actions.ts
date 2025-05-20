
"use server";

import { enhanceProfilePhoto as enhancePhotoAI, EnhanceProfilePhotoInput } from '@/ai/flows/enhance-profile-photo';
import { suggestProfileTags as suggestTagsAI, SuggestProfileTagsInput } from '@/ai/flows/suggest-profile-tags';

export async function enhanceProfilePhotoAction(input: EnhanceProfilePhotoInput): Promise<{ enhancedPhotoDataUri?: string, error?: string }> {
  try {
    const result = await enhancePhotoAI(input);
    return { enhancedPhotoDataUri: result.enhancedPhotoDataUri };
  } catch (error) {
    console.error("Error enhancing profile photo:", error);
    return { error: "Error al mejorar la foto. Por favor, inténtalo de nuevo." };
  }
}

export async function suggestProfileTagsAction(input: SuggestProfileTagsInput): Promise<{ tags?: string[], error?: string }> {
  try {
    const result = await suggestTagsAI(input);
    return { tags: result.tags };
  } catch (error) {
    console.error("Error suggesting profile tags:", error);
    return { error: "Error al sugerir etiquetas. Por favor, inténtalo de nuevo." };
  }
}
