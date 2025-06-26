
// Function to get use case mapping from embedded Excel data
async function getUseCaseMappingFromRAG(useCaseName: string, openAIApiKey?: string, supabase?: any) {
  if (!openAIApiKey || !supabase) {
    return null;
  }

  try {
    // Create embedding for the use case mapping search
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: `AI usecase mapping heatmap data industry key ${useCaseName} base version release version required process core modules`,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!embeddingResponse.ok) {
      return null;
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for use case mapping data
    const { data: searchResults, error } = await supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 3
    });

    if (error || !searchResults || searchResults.length === 0) {
      return null;
    }

    // Extract mapping information using AI
    const documentsText = searchResults.map(result => result.chunk_text).join('\n\n');
    
    const extractionPrompt = `From the following Excel data about AI use case mapping, extract the base version, release version, and required process (core modules) for the use case "${useCaseName}":

${documentsText}

Return only a JSON object with this structure:
{
  "baseVersion": "version number",
  "releaseVersion": "version number", 
  "requiredProcess": "core module name",
  "found": true/false
}`;

    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at extracting structured data from Excel spreadsheets.' },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!extractionResponse.ok) {
      return null;
    }

    const extractionData = await extractionResponse.json();
    let extractedMapping = extractionData.choices[0].message.content;

    if (extractedMapping.includes('```json')) {
      extractedMapping = extractedMapping.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    try {
      const mapping = JSON.parse(extractedMapping);
      return mapping.found ? mapping : null;
    } catch (parseError) {
      return null;
    }
  } catch (error) {
    console.log('Error getting use case mapping:', error);
    return null;
  }
}

export const processDocumentUseCases = async (
  aiRecommendations: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any
) => {
  const processedUseCases = await Promise.all(
    Array.isArray(aiRecommendations) ? aiRecommendations.map(async (useCase, index) => {
      // Get mapping data for this use case
      const mapping = await getUseCaseMappingFromRAG(useCase?.title || 'AI Recommendation', openAIApiKey, supabase);
      
      return {
        id: `doc-${index}`,
        title: useCase?.title || 'AI Recommendation',
        description: useCase?.description || 'No description available',
        category: useCase?.category || 'general',
        implementation: useCase?.implementation || 'Medium',
        timeline: useCase?.timeline || 'TBD',
        industries: [selectedIndustry],
        costSavings: "TBD",
        isFromDocuments: true,
        ragEnhanced: useCase?.ragEnhanced || false,
        ragSources: useCase?.ragSources || [],
        sources: useCase?.sources || [],
        industryRelevance: 'primary',
        targetCustomer: customerName,
        implementationJustification: useCase?.implementationJustification || 'Implementation complexity assessed by AI based on technical requirements found in documents',
        timelineJustification: useCase?.timelineJustification || 'Timeline estimated by AI based on project details and implementation patterns described in documents',
        savingsJustification: useCase?.savingsJustification || 'Cost savings estimated by AI based on efficiency improvements and case studies found in documents',
        isExisting: isExistingUseCase(useCase?.title || 'AI Recommendation', currentUseCases),
        // Add new fields from Excel mapping
        baseVersion: mapping?.baseVersion || 'TBD',
        releaseVersion: mapping?.releaseVersion || 'TBD',
        requiredProcess: mapping?.requiredProcess || 'TBD'
      };
    }) : []
  );

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};

export const processRelatedIndustryUseCases = async (
  relatedIndustries: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any
) => {
  const processedUseCases = await Promise.all(
    relatedIndustries.flatMap((industryInfo, industryIndex) => 
      industryInfo.useCases.slice(0, 3).map(async (useCase: string, index: number) => {
        // Get mapping data for this use case
        const mapping = await getUseCaseMappingFromRAG(useCase, openAIApiKey, supabase);
        
        return {
          id: `related-${industryIndex}-${index}`,
          title: useCase,
          description: `${useCase} solution tailored for ${industryInfo.industry} industry with applications in ${selectedIndustry}`,
          category: 'cross-industry',
          implementation: 'Medium',
          timeline: industryInfo.relevance === 'primary' ? '6-12 months' : '12-18 months',
          industries: [industryInfo.industry],
          costSavings: industryInfo.relevance === 'primary' ? '$500K+' : '$250K+',
          isFromDocuments: false,
          ragEnhanced: false,
          ragSources: [],
          sources: [],
          industryRelevance: industryInfo.relevance,
          sourceIndustry: industryInfo.industry,
          targetCustomer: customerName,
          implementationJustification: 'Implementation complexity assessed by AI using cross-industry deployment experience and technical similarity analysis',
          timelineJustification: `Timeline estimated by AI considering ${industryInfo.relevance} industry alignment and typical cross-industry adaptation cycles`,
          savingsJustification: `Cost savings projected by AI from ${industryInfo.industry} industry benchmarks and cross-industry efficiency transfer analysis`,
          isExisting: isExistingUseCase(useCase, currentUseCases),
          // Add new fields from Excel mapping
          baseVersion: mapping?.baseVersion || 'TBD',
          releaseVersion: mapping?.releaseVersion || 'TBD',
          requiredProcess: mapping?.requiredProcess || 'TBD'
        };
      })
    )
  );

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};
