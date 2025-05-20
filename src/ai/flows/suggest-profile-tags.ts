// use server'

/**
 * @fileOverview AI agent that suggests relevant tags or keywords for a user profile based on their interests and preferences.
 *
 * - suggestProfileTags - A function that suggests profile tags.
 * - SuggestProfileTagsInput - The input type for the suggestProfileTags function.
 * - SuggestProfileTagsOutput - The return type for the suggestProfileTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProfileTagsInputSchema = z.object({
  interests: z
    .string()
    .describe('A description of the user interests and preferences.'),
});
export type SuggestProfileTagsInput = z.infer<typeof SuggestProfileTagsInputSchema>;

const SuggestProfileTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags or keywords.'),
});
export type SuggestProfileTagsOutput = z.infer<typeof SuggestProfileTagsOutputSchema>;

export async function suggestProfileTags(input: SuggestProfileTagsInput): Promise<SuggestProfileTagsOutput> {
  return suggestProfileTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProfileTagsPrompt',
  input: {schema: SuggestProfileTagsInputSchema},
  output: {schema: SuggestProfileTagsOutputSchema},
  prompt: `You are an AI assistant specializing in generating relevant tags for user profiles.

  Given the user's interests and preferences, suggest a list of tags or keywords that accurately reflect their profile.
  The tags should be specific and help improve match accuracy with other users.

  Interests and Preferences: {{{interests}}}

  Suggest tags:`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestProfileTagsFlow = ai.defineFlow(
  {
    name: 'suggestProfileTagsFlow',
    inputSchema: SuggestProfileTagsInputSchema,
    outputSchema: SuggestProfileTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
