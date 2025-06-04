
'use server';
/**
 * @fileOverview A Genkit flow to answer user questions about their financial transactions.
 *
 * - queryFinancialData - A function that takes a user's question and their transaction history
 *   to provide an AI-generated answer.
 * - FinancialQueryInput - The input type for the queryFinancialData function.
 * - FinancialQueryOutput - The return type for the queryFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialQueryInputSchema = z.object({
  userQuery: z.string().describe("The user's question about their financial data."),
  transactionHistoryCsv: z.string().describe('The transaction history of the user, as a CSV string. Columns: Date,Description,Amount,Category,Type'),
});
export type FinancialQueryInput = z.infer<typeof FinancialQueryInputSchema>;

const FinancialQueryOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user query, based on the provided transaction history.'),
});
export type FinancialQueryOutput = z.infer<typeof FinancialQueryOutputSchema>;

export async function queryFinancialData(input: FinancialQueryInput): Promise<FinancialQueryOutput> {
  return financialQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialQueryPrompt',
  input: {schema: FinancialQueryInputSchema},
  output: {schema: FinancialQueryOutputSchema},
  prompt: `You are a helpful financial assistant. Analyze the provided transaction history to answer the user's question.
Base your answers strictly on the data given in the CSV. Do not make up information or answer questions outside the scope of this transaction data.
If the question cannot be answered from the provided transaction data, clearly state that.

User's Question: {{{userQuery}}}

Transaction History (CSV):
{{{transactionHistoryCsv}}}

Provide a concise answer to the user's question.
`,
});

const financialQueryFlow = ai.defineFlow(
  {
    name: 'financialQueryFlow',
    inputSchema: FinancialQueryInputSchema,
    outputSchema: FinancialQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || typeof output.answer !== 'string' || output.answer.trim() === '') {
        return { answer: "I apologize, I couldn't generate an answer based on the provided data. Please try rephrasing your question or ensure your transactions are up to date." };
    }
    return output;
  }
);

