
import type { DocumentUseCase } from './types.ts';

// Search for ML use cases in uploaded documents using RAG
export async function searchDocumentUseCases(
  query: string, 
  customerName: string, 
  industry: string,
  openAIApiKey?: string,
  supabase?: any
): Promise<DocumentUseCase[]> {
  try {
    console.log('Searching documents for use cases...');
    
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
        input: `${customerName} ${industry} AI ML use cases solutions recommendations`,
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

    // Use OpenAI to extract use cases from the found documents
    const documentsText = searchResults.map(result => result.chunk_text).join('\n\n');
    
    const extractionPrompt = `Based on the following document excerpts, extract specific AI/ML use cases that would be relevant for a ${industry} company like ${customerName}. 

Document content:
${documentsText}

Please extract and format ONLY the use cases mentioned in these documents. Return as a JSON array with this structure:
[
  {
    "title": "Use Case Title",
    "description": "Detailed description from the documents",
    "category": "category_name",
    "roi": "estimated_roi_percentage",
    "implementation": "Low|Medium|High",
    "timeline": "time_estimate",
    "source": "document_source"
  }
]

IMPORTANT: Only extract use cases that are explicitly mentioned in the provided documents. Do not create new use cases.`;

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
            content: 'You are an expert at extracting AI/ML use cases from technical documents. Only extract information that is explicitly mentioned in the provided text.' 
          },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0.1,
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
      console.log(`Extracted ${useCases.length} use cases from documents`);
      
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
