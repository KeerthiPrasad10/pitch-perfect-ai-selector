
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

// Base industry use cases
const industryUseCases = {
  manufacturing: ['Predictive Maintenance', 'Quality Control Automation', 'Supply Chain Optimization', 'Energy Consumption Optimization'],
  energy: ['Energy Demand Forecasting', 'Predictive Maintenance', 'Asset Performance Optimization', 'Grid Stability Management'],
  aerospace: ['Predictive Maintenance', 'Quality Control Automation', 'Supply Chain Risk Management', 'Flight Operations Optimization'],
  construction: ['Project Timeline Optimization', 'Supply Chain Management', 'Safety Risk Assessment', 'Equipment Maintenance'],
  service: ['Customer Service Chatbots', 'Document Processing Automation', 'Price Optimization', 'Customer Behavior Analytics'],
  telco: ['Network Optimization', 'Customer Service Chatbots', 'Fraud Detection System', 'Predictive Network Maintenance'],
  healthcare: ['Medical Image Analysis', 'Drug Discovery Acceleration', 'Patient Risk Assessment', 'Treatment Optimization'],
  finance: ['Fraud Detection System', 'Credit Risk Assessment', 'Algorithmic Trading', 'Customer Service Chatbots'],
  retail: ['Demand Forecasting', 'Price Optimization', 'Customer Behavior Analytics', 'Inventory Management'],
  automotive: ['Predictive Maintenance', 'Quality Control Automation', 'Autonomous Vehicle Systems', 'Supply Chain Optimization'],
  utilities: ['Smart Grid Management', 'Energy Consumption Optimization', 'Predictive Maintenance', 'Customer Service Automation'],
  technology: ['Automated Code Generation', 'System Performance Optimization', 'Customer Service Chatbots', 'Cybersecurity Threat Detection'],
  logistics: ['Route Optimization', 'Demand Forecasting', 'Warehouse Automation', 'Supply Chain Optimization'],
  education: ['Personalized Learning Systems', 'Student Performance Analytics', 'Administrative Automation', 'Content Recommendation'],
  other: ['Document Processing Automation', 'Customer Service Chatbots', 'Data Analytics', 'Process Optimization']
};

// Enhanced function to get contextual industry relationships
async function getContextualIndustryRelationships(companyName: string, primaryIndustry: string, companyDescription?: string) {
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
        relevance: 'primary',
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
function getStaticIndustryRelationships(primaryIndustry: string) {
  const staticRelationships = {
    manufacturing: {
      related: ['energy', 'automotive'],
      useCases: industryUseCases.manufacturing
    },
    energy: {
      related: ['utilities', 'manufacturing'],
      useCases: industryUseCases.energy
    },
    aerospace: {
      related: ['manufacturing', 'technology'],
      useCases: industryUseCases.aerospace
    },
    construction: {
      related: ['manufacturing', 'logistics'],
      useCases: industryUseCases.construction
    },
    service: {
      related: ['retail', 'technology'],
      useCases: industryUseCases.service
    },
    telco: {
      related: ['technology', 'service'],
      useCases: industryUseCases.telco
    },
    healthcare: {
      related: ['technology', 'service'],
      useCases: industryUseCases.healthcare
    },
    finance: {
      related: ['service', 'technology'],
      useCases: industryUseCases.finance
    },
    retail: {
      related: ['service', 'logistics'],
      useCases: industryUseCases.retail
    },
    automotive: {
      related: ['manufacturing', 'energy'],
      useCases: industryUseCases.automotive
    },
    utilities: {
      related: ['energy', 'service'],
      useCases: industryUseCases.utilities
    },
    technology: {
      related: ['service', 'telco'],
      useCases: industryUseCases.technology
    },
    logistics: {
      related: ['retail', 'manufacturing'],
      useCases: industryUseCases.logistics
    },
    education: {
      related: ['service', 'technology'],
      useCases: industryUseCases.education
    },
    other: {
      related: ['service', 'technology'],
      useCases: industryUseCases.other
    }
  };

  const industryInfo = staticRelationships[primaryIndustry] || staticRelationships.other;
  
  return [
    {
      industry: primaryIndustry,
      relevance: 'primary',
      useCases: industryInfo.useCases,
      description: `Core industry with highest relevance for AI implementations`
    },
    {
      industry: industryInfo.related[0] || 'service',
      relevance: 'secondary',
      useCases: industryUseCases[industryInfo.related[0]] || industryUseCases.service,
      description: `Highly related industry with similar operational challenges`
    },
    {
      industry: industryInfo.related[1] || 'technology',
      relevance: 'tertiary',
      useCases: industryUseCases[industryInfo.related[1]] || industryUseCases.technology,
      description: `Related industry with transferable AI solutions`
    }
  ];
}

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

// Enhanced company analysis with OpenAI
async function getCompanyDetails(companyName: string, isIFSCustomer: boolean = false) {
  if (!openAIApiKey) {
    return {
      formalName: companyName,
      description: `Analysis for ${companyName}`,
      revenue: null,
      employees: null,
      businessModel: null,
      keyProducts: null
    };
  }

  try {
    const prompt = `Provide detailed information about the company "${companyName}". Return a JSON object with:
    {
      "formalName": "Official legal company name",
      "description": "Brief description of their business, what they do, main products/services",
      "revenue": "Annual revenue if known (e.g., '$5B', '$500M')",
      "employees": "Number of employees if known (e.g., '10,000+', '500-1000')",
      "businessModel": "Brief description of their business model and key differentiators",
      "keyProducts": "Main products or services they offer"
    }
    
    Be factual and concise. If information is not available, use null for that field.`;

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
            content: 'You are a business intelligence expert. Provide factual company information in the requested JSON format only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get company details');
    }

    const data = await response.json();
    let companyInfo = data.choices[0].message.content;

    // Clean up response if it has markdown formatting
    if (companyInfo.includes('```json')) {
      companyInfo = companyInfo.replace(/```json\n?/, '').replace(/\n?```/, '');
    }

    const details = JSON.parse(companyInfo);
    
    // Add IFS-specific details if it's a customer
    if (isIFSCustomer) {
      details.ifsVersion = "IFS Cloud"; // Default, could be enhanced with actual data
      details.customerSince = "2020+"; // Default, could be enhanced with actual data
    }
    
    return details;
  } catch (error) {
    console.log('Error getting company details:', error);
    return {
      formalName: companyName,
      description: `${companyName} is a company in the specified industry`,
      revenue: null,
      employees: null,
      businessModel: null,
      keyProducts: null
    };
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
      
      // Get enhanced company details
      const companyDetails = await getCompanyDetails(ifsCustomer.customer_name, true);
      
      // Get relevant use cases from uploaded documents
      documentUseCases = await searchDocumentUseCases(customerName, ifsCustomer.industry, ifsCustomer.industry);
      
      // Get contextual related industries and their use cases
      const relatedIndustries = await getContextualIndustryRelationships(
        ifsCustomer.customer_name, 
        ifsCustomer.industry, 
        companyDetails.description
      );
      
      analysis = {
        customerType: "customer",
        industry: ifsCustomer.industry,
        confidence: "high",
        reasoning: `${companyDetails.formalName} is a confirmed IFS customer in the ${ifsCustomer.industry} industry.`,
        currentUseCases: ifsCustomer.current_ml_usecases || [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: [],
        relatedIndustries: relatedIndustries,
        companyDetails: companyDetails
      };
    } else {
      // Company is a prospect - search for similar IFS companies and get document-based recommendations
      console.log(`${customerName} is a prospect - searching for similar companies and document recommendations`);
      
      const similarCompanies = await searchSimilarIFSCompanies(customerName);
      
      // Try to determine industry if possible, otherwise use a generic approach
      let prospectIndustry = "other";
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

      // Get enhanced company details
      const companyDetails = await getCompanyDetails(customerName, false);

      // Get document-based use cases for the prospect
      documentUseCases = await searchDocumentUseCases(customerName, prospectIndustry, prospectIndustry);
      
      // Get contextual related industries and their use cases
      const relatedIndustries = await getContextualIndustryRelationships(
        customerName, 
        prospectIndustry, 
        companyDetails.description
      );
      
      analysis = {
        customerType: "prospect",
        industry: prospectIndustry,
        confidence: "medium",
        reasoning: `${companyDetails.formalName} has been identified as a potential prospect in the ${prospectIndustry} industry.`,
        currentUseCases: [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: similarCompanies,
        relatedIndustries: relatedIndustries,
        companyDetails: companyDetails
      };
    }

    console.log('Analysis complete:', analysis);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      industry: analysis.industry,
      relevantUseCases: analysis.documentBasedUseCases,
      relatedIndustries: analysis.relatedIndustries
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
        suggestedCompanies: [],
        relatedIndustries: [],
        companyDetails: {
          formalName: "Unknown",
          description: "Unable to analyze company",
          revenue: null,
          employees: null
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
