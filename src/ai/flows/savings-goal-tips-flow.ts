
'use server';
/**
 * @fileOverview A Genkit flow to generate tips for achieving savings goals.
 *
 * - generateSavingsGoalTips - A function that provides tips for a given savings goal.
 * - GenerateSavingsGoalTipsInput - The input type for the generateSavingsGoalTips function.
 * - GenerateSavingsGoalTipsOutput - The return type for the generateSavingsGoalTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSavingsGoalTipsInputSchema = z.object({
  goalName: z.string().describe('The name of the savings goal.'),
  targetAmount: z.number().describe('The target amount for the savings goal.'),
  currentAmount: z.number().describe('The current amount saved for the goal.'),
  deadline: z.string().optional().describe('The optional deadline for the goal (ISO date string).'),
});
export type GenerateSavingsGoalTipsInput = z.infer<typeof GenerateSavingsGoalTipsInputSchema>;

const GenerateSavingsGoalTipsOutputSchema = z.object({
  tips: z.string().describe('A string containing 2-3 concise, actionable, and encouraging tips for reaching the savings goal.'),
});
export type GenerateSavingsGoalTipsOutput = z.infer<typeof GenerateSavingsGoalTipsOutputSchema>;

export async function generateSavingsGoalTips(input: GenerateSavingsGoalTipsInput): Promise<GenerateSavingsGoalTipsOutput> {
  return savingsGoalTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsGoalTipsPrompt',
  input: {schema: GenerateSavingsGoalTipsInputSchema},
  output: {schema: GenerateSavingsGoalTipsOutputSchema},
  prompt: `You are a helpful and encouraging financial coach.
  A user is trying to save for a goal with the following details:
  - Goal Name: {{{goalName}}}
  - Target Amount: {{{targetAmount}}}
  - Current Amount Saved: {{{currentAmount}}}
  {{#if deadline}}- Deadline: {{{deadline}}}{{/if}}

  Please provide 2-3 concise, actionable, and encouraging tips to help them reach this specific savings goal.
  Focus on practical advice. Start each tip with a dash (-) or a bullet point.
  Keep the entire response to a maximum of 150 words.
  Example:
  "- Try automating a small weekly transfer to your savings.
  - Review your subscriptions and cut one you don't use often.
  - Visualize achieving your goal to stay motivated!"
  `,
});

const savingsGoalTipsFlow = ai.defineFlow(
  {
    name: 'savingsGoalTipsFlow',
    inputSchema: GenerateSavingsGoalTipsInputSchema,
    outputSchema: GenerateSavingsGoalTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
