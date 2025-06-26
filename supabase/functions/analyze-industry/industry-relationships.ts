
import { industryUseCases, availableIndustries } from './industry-config.ts';
import type { RelatedIndustry } from './types.ts';

// Get contextual industry relationships - FACTUAL DATA ONLY
export async function getContextualIndustryRelationships(
  companyName: string, 
  primaryIndustry: string, 
  companyDescription?: string,
  openAIApiKey?: string,
  documentInsights?: string[]
): Promise<RelatedIndustry[]> {
  // Return only the primary industry classification - no AI generation of related industries
  return [
    {
      industry: primaryIndustry,
      relevance: 'primary' as const,
      reasoning: `Primary industry classification for ${companyName}`,
      useCases: [], // No generated use cases
      description: `Primary industry classification for ${companyName}`
    }
  ];
}
