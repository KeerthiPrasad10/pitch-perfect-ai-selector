
import type { DocumentUseCase } from './types.ts';

// Search for ML use cases in uploaded documents using RAG - FACTUAL DATA ONLY
export async function searchDocumentUseCases(
  query: string, 
  customerName: string, 
  industry: string,
  openAIApiKey?: string,
  supabase?: any
): Promise<DocumentUseCase[]> {
  try {
    console.log('Searching documents for factual use cases...');
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not available for embeddings');
      return [];
    }

    if (!supabase) {
      console.log('Supabase client not available');
      return [];
    }

    // Create embedding for the search query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: `${customerName} ${industry} AI ML use cases solutions implementations`,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!embeddingResponse.ok) {
      console.log('Failed to create embedding');
      return [];
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar content in uploaded documents
    const { data: searchResults, error } = await supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (error) {
      console.log('Error searching embeddings:', error);
      return [];
    }

    if (!searchResults || searchResults.length === 0) {
      console.log('No relevant documents found');
      return [];
    }

    console.log(`Found ${searchResults.length} relevant document chunks`);

    // Use OpenAI to extract ONLY FACTUAL use cases from the found documents
    const documentsText = searchResults.map(result => result.chunk_text).join('\n\n');
    
    const extractionPrompt = `From the following document excerpts, extract ONLY the FACTUAL AI/ML use cases that are explicitly mentioned or documented. Do NOT generate, suggest, or infer any use cases.

Document content:
${documentsText}

IMPORTANT INSTRUCTIONS:
- Extract ONLY use cases that are explicitly mentioned in the documents
- Do NOT generate or suggest any new use cases
- Do NOT make assumptions or inferences
- If no explicit use cases are found, return an empty array
- Only include use cases with clear factual basis in the provided text

Return as a JSON array with this structure (or empty array [] if no factual use cases found):
[
  {
    "title": "Exact title from document",
    "description": "Exact description from document",
    "category": "category if mentioned, otherwise 'documented'",
    "roi": "ROI if explicitly stated, otherwise 'TBD'",
    "implementation": "Implementation status if mentioned, otherwise 'TBD'",
    "timeline": "Timeline if mentioned, otherwise 'TBD'",
    "source": "document_source",
    "roiJustification": "Quote the exact text that mentions ROI/benefits",
    "implementationJustification": "Quote the exact text about implementation", 
    "timelineJustification": "Quote the exact text about timeline",
    "savingsJustification": "Quote the exact text about cost savings"
  }
]

REMEMBER: Only extract what is explicitly documented. Do not generate anything new.`;

    const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a document analyst that extracts ONLY factual information explicitly mentioned in provided text. You never generate, suggest, or infer anything beyond what is clearly documented.' 
          },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0,
      }),
    });

    if (!extractionResponse.ok) {
      console.log('Failed to extract use cases from documents');
      return [];
    }

    const extractionData = await extractionResponse.json();
    let extractedUseCases = extractionData.choices[0].message.content;

    // Clean up response if it has markdown formatting
    if (extractedUseCases.includes('```json')) {
      extractedUseCases = extractedUseCases.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    try {
      const useCases = JSON.parse(extractedUseCases);
      console.log(`Extracted ${useCases.length} factual use cases from documents`);
      
      // Add source information from search results
      return useCases.map((useCase: any, index: number) => ({
        ...useCase,
        isFromDocuments: true,
        sources: searchResults.slice(0, 2).map(result => ({
          file_name: result.file_name,
          similarity: result.similarity
        }))
      }));
    } catch (parseError) {
      console.log('Failed to parse extracted use cases:', parseError);
      return [];
    }
  } catch (error) {
    console.log('Error in document search:', error);
    return [];
  }
}

// Get document insights for industry relationship analysis - FACTUAL ONLY
export async function getDocumentInsights(
  customerName: string,
  openAIApiKey?: string,
  supabase?: any
): Promise<string[]> {
  try {
    if (!openAIApiKey || !supabase) {
      return [];
    }

    // Create embedding for company-specific search
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: `${customerName} business operations industry sector activities`,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!embeddingResponse.ok) {
      return [];
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for company-related content
    const { data: searchResults, error } = await supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6,
      match_count: 3
    });

    if (error || !searchResults || searchResults.length === 0) {
      return [];
    }

    // Return factual excerpts from documents
    return searchResults.map(result => 
      `${result.file_name}: ${result.chunk_text.substring(0, 200)}...`
    );
  } catch (error) {
    console.log('Error getting document insights:', error);
    return [];
  }
}
