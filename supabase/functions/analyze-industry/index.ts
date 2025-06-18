
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Search for ML use cases in uploaded documents using RAG
async function searchDocumentUseCases(query: string, customerName: string, industry: string) {
  try {
    console.log('Searching documents for use cases...');
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not available for embeddings');
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

// Check if company is an IFS customer
async function checkIFSCustomer(companyName: string) {
  try {
    console.log(`Checking if ${companyName} is an IFS customer...`);
    
    // Search for exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', companyName)
      .single();

    if (!exactError && exactMatch) {
      console.log(`Found exact match: ${exactMatch.customer_name}`);
      return exactMatch;
    }

    // Search for partial matches
    const { data: partialMatches, error: partialError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', `%${companyName}%`)
      .limit(5);

    if (!partialError && partialMatches && partialMatches.length > 0) {
      console.log(`Found ${partialMatches.length} partial matches`);
      // Return the first match for now, could be enhanced with better matching logic
      return partialMatches[0];
    }

    console.log('No IFS customer match found');
    return null;
  } catch (error) {
    console.log('Error checking IFS customer:', error);
    return null;
  }
}

// Search for similar company names in IFS database
async function searchSimilarIFSCompanies(companyName: string) {
  try {
    const { data: companies, error } = await supabase
      .from('ifs_customers')
      .select('customer_name, industry')
      .ilike('customer_name', `%${companyName.split(' ')[0]}%`)
      .limit(10);

    if (error) {
      console.log('Error searching similar companies:', error);
      return [];
    }

    return companies?.map(company => ({
      name: company.customer_name,
      industry: company.industry,
      isIFSCustomer: true
    })) || [];
  } catch (error) {
    console.log('Error in similar company search:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName } = await req.json();
    console.log('Analyzing customer:', customerName);

    // Check if company is an IFS customer
    const ifsCustomer = await checkIFSCustomer(customerName);
    
    let analysis;
    let documentUseCases: any[] = [];

    if (ifsCustomer) {
      // Company is an IFS customer
      console.log(`${customerName} is an IFS customer in ${ifsCustomer.industry} industry`);
      
      // Get relevant use cases from uploaded documents
      documentUseCases = await searchDocumentUseCases(customerName, ifsCustomer.industry, ifsCustomer.industry);
      
      analysis = {
        customerType: "customer",
        industry: ifsCustomer.industry,
        confidence: "high",
        reasoning: `${ifsCustomer.customer_name} is a confirmed IFS customer in the ${ifsCustomer.industry} industry.`,
        currentUseCases: ifsCustomer.current_ml_usecases || [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: []
      };
    } else {
      // Company is a prospect - search for similar IFS companies and get document-based recommendations
      console.log(`${customerName} is a prospect - searching for similar companies and document recommendations`);
      
      const similarCompanies = await searchSimilarIFSCompanies(customerName);
      
      // Try to determine industry if possible, otherwise use a generic approach
      let prospectIndustry = "unknown";
      if (openAIApiKey) {
        try {
          const industryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are an industry classification expert. Respond with only the industry name in lowercase (manufacturing, healthcare, finance, retail, technology, automotive, energy, utilities, education, government, logistics, media, insurance, real-estate, agriculture, hospitality, construction, engineering, aerospace, defence, service, telco, other).' 
                },
                { role: 'user', content: `What industry is "${customerName}" most likely in?` }
              ],
              temperature: 0.1,
            }),
          });

          if (industryResponse.ok) {
            const industryData = await industryResponse.json();
            prospectIndustry = industryData.choices[0].message.content.trim().toLowerCase();
            console.log(`Determined prospect industry: ${prospectIndustry}`);
          }
        } catch (error) {
          console.log('Could not determine prospect industry:', error);
        }
      }

      // Get document-based use cases for the prospect
      documentUseCases = await searchDocumentUseCases(customerName, prospectIndustry, prospectIndustry);
      
      analysis = {
        customerType: "prospect",
        industry: prospectIndustry,
        confidence: "medium",
        reasoning: `${customerName} is not found in our IFS customer database, treating as a prospect.`,
        currentUseCases: [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: similarCompanies
      };
    }

    console.log('Analysis complete:', analysis);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      industry: analysis.industry,
      relevantUseCases: analysis.documentBasedUseCases
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-industry function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      analysis: {
        customerType: "unknown",
        industry: "unknown",
        confidence: "low",
        reasoning: "An error occurred during analysis",
        currentUseCases: [],
        documentBasedUseCases: [],
        suggestedCompanies: []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
