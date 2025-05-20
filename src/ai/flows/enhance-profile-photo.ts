// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview Enhances a user's profile photo using AI to improve its quality and attractiveness.
 *
 * - enhanceProfilePhoto - A function that enhances the profile photo.
 * - EnhanceProfilePhotoInput - The input type for the enhanceProfilePhoto function.
 * - EnhanceProfilePhotoOutput - The return type for the enhanceProfilePhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceProfilePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhanceProfilePhotoInput = z.infer<typeof EnhanceProfilePhotoInputSchema>;

const EnhanceProfilePhotoOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The enhanced photo as a data URI in base64 format.'),
});
export type EnhanceProfilePhotoOutput = z.infer<typeof EnhanceProfilePhotoOutputSchema>;

export async function enhanceProfilePhoto(input: EnhanceProfilePhotoInput): Promise<EnhanceProfilePhotoOutput> {
  return enhanceProfilePhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceProfilePhotoPrompt',
  input: {schema: EnhanceProfilePhotoInputSchema},
  output: {schema: EnhanceProfilePhotoOutputSchema},
  prompt: `Enhance the quality and attractiveness of the following profile photo. The enhanced photo should still look like the same person.

Photo: {{media url=photoDataUri}}
`,
});

const enhanceProfilePhotoFlow = ai.defineFlow(
  {
    name: 'enhanceProfilePhotoFlow',
    inputSchema: EnhanceProfilePhotoInputSchema,
    outputSchema: EnhanceProfilePhotoOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'enhance this photo for use as a dating profile photo'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {enhancedPhotoDataUri: media.url!};
  }
);
