
import { industryUseCases, availableIndustries } from './industry-config.ts';
import type { RelatedIndustry } from './types.ts';

// Enhanced function to get contextual industry relationships using AI and document insights
export async function getContextualIndustryRelationships(
  companyName: string, 
  primaryIndustry: string, 
  companyDescription?: string,
  openAIApiKey?: string,
  documentInsights?: string[]
): Promise<RelatedIndustry[]> {
  if (!openAIApiKey) {
    // Simple fallback without static relationships
    return [
      {
        industry: primaryIndustry,
        relevance: 'primary' as const,
        reasoning: `Core industry with highest relevance for AI implementations`,
        useCases: industryUseCases[primaryIndustry] || industryUseCases.other,
        description: `Core industry with highest relevance for AI implementations`
      }
    ];
  }

  try {
    // Prepare document context if available
    const documentContext = documentInsights && documentInsights.length > 0 
      ? `\n\nDocument insights about ${companyName}:\n${documentInsights.join('\n')}`
      : '';

    const prompt = `Analyze the company "${companyName}" and determine the most accurate primary industry classification and related industries for AI/ML use cases.

Company context:
- Current classification: ${primaryIndustry}
- Company description: ${companyDescription || 'No additional context'}${documentContext}

Based on this company's specific business model and actual operations, provide:

1. The MOST ACCURATE primary industry classification
2. 2-3 most relevant related industries that would have transferable AI/ML solutions

Consider:
- The company's actual business operations and revenue sources
- Supply chain relationships and technology dependencies
- Customer segments and operational similarities
- Cross-industry applicability of AI solutions
- Document insights (if provided) about the company's actual activities

Available industries: ${availableIndustries.join(', ')}

Return a JSON array with this structure:
[
  {
    "industry": "most_accurate_primary_industry",
    "relevance": "primary",
    "reasoning": "Why this is the most accurate primary classification based on company's main business",
    "useCases": ["UseCase1", "UseCase2", "UseCase3", "UseCase4"]
  },
  {
    "industry": "related_industry_1",
    "relevance": "secondary", 
    "reasoning": "Specific business relationship or operational similarity",
    "useCases": ["UseCase1", "UseCase2", "UseCase3", "UseCase4"]
  },
  {
    "industry": "related_industry_2",
    "relevance": "tertiary",
    "reasoning": "Technology or process transferability",
    "useCases": ["UseCase1", "UseCase2", "UseCase3", "UseCase4"]
  }
]

Focus on actual business relationships and operational realities rather than generic categorizations. If the current classification seems incorrect based on the company description, suggest the more accurate primary industry.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert business analyst specializing in industry classification and AI/ML applications. Provide accurate industry classifications based on actual business operations, not just company names or initial assumptions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.log('Failed to get contextual industry relationships');
      return getMinimalFallback(primaryIndustry);
    }

    const data = await response.json();
    let relatedIndustries = data.choices[0].message.content;

    // Clean up response if it has markdown formatting
    if (relatedIndustries.includes('```json')) {
      relatedIndustries = relatedIndustries.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const parsedRelatedIndustries = JSON.parse(relatedIndustries);
    
    // Ensure we have proper use cases for each industry
    const result = parsedRelatedIndustries.map((item: any) => ({
      ...item,
      useCases: item.useCases || industryUseCases[item.industry] || industryUseCases.other,
      description: item.reasoning
    }));

    console.log(`Generated AI-driven industry relationships for ${companyName}:`, result);
    return result;

  } catch (error) {
    console.log('Error generating contextual industry relationships:', error);
    return getMinimalFallback(primaryIndustry);
  }
}

// Simple fallback without static relationships
function getMinimalFallback(primaryIndustry: string): RelatedIndustry[] {
  return [
    {
      industry: primaryIndustry,
      relevance: 'primary',
      useCases: industryUseCases[primaryIndustry] || industryUseCases.other,
      reasoning: `Core industry with highest relevance for AI implementations`,
      description: `Core industry with highest relevance for AI implementations`
    }
  ];
}
