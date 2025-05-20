// use server'

/**
 * @fileOverview AI agent that generates a profile summary based on user details.
 *
 * - generateProfileSummary - A function that generates a profile summary.
 * - GenerateProfileSummaryInput - The input type for the generateProfileSummary function.
 * - GenerateProfileSummaryOutput - The return type for the generateProfileSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProfileSummaryInputSchema = z.object({
  interests: z
    .string()
    .describe('A description of the user interests and preferences.'),
  gender: z.string().describe('The gender of the user (Male, Female, or Other).'),
  age: z.number().describe('The age of the user.'),
  desiredGender: z.string().describe('The desired gender of the match (Male, Female, or Both).'),
  desiredAgeRange: z.string().describe('The desired age range of the match (e.g., 20-30).'),
});
export type GenerateProfileSummaryInput = z.infer<typeof GenerateProfileSummaryInputSchema>;

const GenerateProfileSummaryOutputSchema = z.object({
  summary: z.string().describe('A compelling profile summary.'),
});
export type GenerateProfileSummaryOutput = z.infer<typeof GenerateProfileSummaryOutputSchema>;

export async function generateProfileSummary(input: GenerateProfileSummaryInput): Promise<GenerateProfileSummaryOutput> {
  return generateProfileSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProfileSummaryPrompt',
  input: {schema: GenerateProfileSummaryInputSchema},
  output: {schema: GenerateProfileSummaryOutputSchema},
  prompt: `You are an AI assistant specializing in generating compelling profile summaries for dating apps.

  Given the user's interests, gender, age, desired gender, and desired age range, create a brief and engaging profile summary.
  The summary should highlight the user's key attributes and attract potential matches.

  Interests: {{{interests}}}
  Gender: {{{gender}}}
  Age: {{{age}}}
  Desired Gender: {{{desiredGender}}}
  Desired Age Range: {{{desiredAgeRange}}}

  Profile Summary:`, config: {
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

const generateProfileSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfileSummaryFlow',
    inputSchema: GenerateProfileSummaryInputSchema,
    outputSchema: GenerateProfileSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
