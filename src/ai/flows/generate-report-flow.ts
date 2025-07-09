
'use server';
/**
 * @fileOverview A flow for generating a final installation report.
 *
 * - generateFinalReport - A function that handles the final report generation.
 * - GenerateFinalReportInput - The input type for the generateFinalReport function.
 * - GenerateFinalReportOutput - The return type for the generateFinalReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateFinalReportInputSchema = z.object({
  installerReport: z.string().describe('The full report from the installer in JSON format.'),
  protocolNumber: z.string().describe('The protocol number provided by the administrator.'),
});
export type GenerateFinalReportInput = z.infer<typeof GenerateFinalReportInputSchema>;

const GenerateFinalReportOutputSchema = z.object({
  finalReport: z.string().describe('The final, consolidated technical report text.'),
});
export type GenerateFinalReportOutput = z.infer<typeof GenerateFinalReportOutputSchema>;

export async function generateFinalReport(input: GenerateFinalReportInput): Promise<GenerateFinalReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: { schema: GenerateFinalReportInputSchema },
  output: { schema: GenerateFinalReportOutputSchema },
  prompt: `
    Você é um engenheiro especialista em instalações de energia solar e sua tarefa é gerar um relatório técnico final.
    
    Analise o relatório do instalador, que está em formato JSON, e use as informações para criar um texto coeso e profissional.
    
    O relatório final deve incluir:
    - O nome do cliente.
    - O número do protocolo fornecido.
    - Uma descrição técnica da instalação, resumindo os principais componentes (potência do painel, inversores, etc.).
    - Uma análise das medições elétricas (VCC e CA), destacando se os valores estão dentro do esperado.
    - Uma confirmação dos componentes e cabeamento utilizados.
    - Uma menção à documentação fotográfica e de vídeo.
    - As observações finais do instalador.
    - Uma conclusão geral sobre a qualidade e o status da instalação.

    Seja claro, objetivo e use uma linguagem técnica apropriada. O relatório é para fins de documentação e verificação final.

    Número de Protocolo: {{{protocolNumber}}}
    Relatório do Instalador (JSON):
    \`\`\`json
    {{{installerReport}}}
    \`\`\`
  `,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateFinalReportInputSchema,
    outputSchema: GenerateFinalReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
