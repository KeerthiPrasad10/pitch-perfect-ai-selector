
import { industryUseCases } from './industry-config.ts';
import { staticRelationships } from './industry-config.ts';
import type { RelatedIndustry } from './types.ts';

// Enhanced function to get contextual industry relationships
export async function getContextualIndustryRelationships(
  companyName: string, 
  primaryIndustry: string, 
  companyDescription?: string,
  openAIApiKey?: string
): Promise<RelatedIndustry[]> {
  if (!openAIApiKey) {
    // Fallback to static relationships if no AI available
    return getStaticIndustryRelationships(primaryIndustry);
  }

  try {
    const prompt = `Analyze the company "${companyName}" and determine the most relevant related industries for AI/ML use cases.

Company context:
- Primary industry: ${primaryIndustry}
- Company description: ${companyDescription || 'No additional context'}

Based on this company's specific business model, identify 2 most relevant related industries that would have transferable AI/ML solutions. Consider:
- Supply chain relationships
- Technology dependencies
- Customer overlap
- Operational similarities
- Regulatory environment similarities

Return a JSON array with this structure:
[
  {
    "industry": "industry_name",
    "relevance": "secondary",
    "reasoning": "Brief explanation of why this industry is relevant",
    "useCases": ["UseCase1", "UseCase2", "UseCase3", "UseCase4"]
  },
  {
    "industry": "industry_name", 
    "relevance": "tertiary",
    "reasoning": "Brief explanation of why this industry is relevant",
    "useCases": ["UseCase1", "UseCase2", "UseCase3", "UseCase4"]
  }
]

Available industries: manufacturing, energy, aerospace, construction, service, telco, healthcare, finance, retail, automotive, utilities, technology, logistics, education

Focus on actual business relationships rather than generic categorizations.`;

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
            content: 'You are an expert business analyst specializing in industry relationships and AI/ML applications. Provide specific, logical industry relationships based on actual business connections.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.log('Failed to get contextual industry relationships');
      return getStaticIndustryRelationships(primaryIndustry);
    }

    const data = await response.json();
    let relatedIndustries = data.choices[0].message.content;

    // Clean up response if it has markdown formatting
    if (relatedIndustries.includes('```json')) {
      relatedIndustries = relatedIndustries.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const parsedRelatedIndustries = JSON.parse(relatedIndustries);
    
    // Add primary industry at the beginning
    const result = [
      {
        industry: primaryIndustry,
        relevance: 'primary' as const,
        reasoning: `Core industry with highest relevance for AI implementations`,
        useCases: industryUseCases[primaryIndustry] || industryUseCases.other,
        description: `Core industry with highest relevance for AI implementations`
      },
      ...parsedRelatedIndustries.map((item: any) => ({
        ...item,
        useCases: item.useCases || industryUseCases[item.industry] || industryUseCases.other,
        description: item.reasoning
      }))
    ];

    console.log(`Generated contextual industry relationships for ${companyName}:`, result);
    return result;

  } catch (error) {
    console.log('Error generating contextual industry relationships:', error);
    return getStaticIndustryRelationships(primaryIndustry);
  }
}

// Fallback static relationships
function getStaticIndustryRelationships(primaryIndustry: string): RelatedIndustry[] {
  const industryInfo = staticRelationships[primaryIndustry] || staticRelationships.other;
  
  return [
    {
      industry: primaryIndustry,
      relevance: 'primary',
      useCases: industryInfo.useCases,
      reasoning: `Core industry with highest relevance for AI implementations`,
      description: `Core industry with highest relevance for AI implementations`
    },
    {
      industry: industryInfo.related[0] || 'service',
      relevance: 'secondary',
      useCases: industryUseCases[industryInfo.related[0]] || industryUseCases.service,
      reasoning: `Highly related industry with similar operational challenges`,
      description: `Highly related industry with similar operational challenges`
    },
    {
      industry: industryInfo.related[1] || 'technology',
      relevance: 'tertiary',
      useCases: industryUseCases[industryInfo.related[1]] || industryUseCases.technology,
      reasoning: `Related industry with transferable AI solutions`,
      description: `Related industry with transferable AI solutions`
    }
  ];
}
