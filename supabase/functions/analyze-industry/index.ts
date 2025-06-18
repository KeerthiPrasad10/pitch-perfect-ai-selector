
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const embeddedUseCaseData = [
  {
    id: 1,
    title: "Predictive Maintenance",
    description: "Use AI to predict equipment failures before they happen, reducing downtime and maintenance costs",
    category: "operations",
    industries: ["manufacturing", "energy", "utilities", "automotive"],
    roi: "250",
    implementation: "Medium",
    timeline: "3-6 months",
    costSavings: "$500K-2M annually"
  },
  {
    id: 2,
    title: "Quality Control Automation",
    description: "Automated visual inspection and defect detection using computer vision",
    category: "quality",
    industries: ["manufacturing", "automotive", "electronics"],
    roi: "180",
    implementation: "Medium",
    timeline: "2-4 months",
    costSavings: "$200K-800K annually"
  },
  {
    id: 3,
    title: "Demand Forecasting",
    description: "AI-powered demand prediction to optimize inventory and reduce waste",
    category: "analytics",
    industries: ["retail", "manufacturing", "logistics", "healthcare"],
    roi: "200",
    implementation: "Low",
    timeline: "1-3 months",
    costSavings: "$300K-1.5M annually"
  },
  {
    id: 4,
    title: "Customer Service Chatbots",
    description: "Intelligent chatbots for 24/7 customer support and query resolution",
    category: "customer-service",
    industries: ["retail", "finance", "healthcare", "technology", "service"],
    roi: "150",
    implementation: "Low",
    timeline: "1-2 months",
    costSavings: "$100K-500K annually"
  },
  {
    id: 5,
    title: "Supply Chain Optimization",
    description: "AI-driven supply chain management and route optimization",
    category: "operations",
    industries: ["logistics", "retail", "manufacturing", "automotive"],
    roi: "220",
    implementation: "High",
    timeline: "6-12 months",
    costSavings: "$1M-5M annually"
  },
  {
    id: 6,
    title: "Fraud Detection System",
    description: "Real-time fraud detection using machine learning algorithms",
    category: "security",
    industries: ["finance", "insurance", "retail", "healthcare"],
    roi: "300",
    implementation: "Medium",
    timeline: "2-4 months",
    costSavings: "$500K-3M annually"
  },
  {
    id: 7,
    title: "Personalized Recommendations",
    description: "AI-powered product and content recommendation engine",
    category: "customer-experience",
    industries: ["retail", "media", "technology", "hospitality"],
    roi: "160",
    implementation: "Medium",
    timeline: "2-3 months",
    costSavings: "$200K-1M annually"
  },
  {
    id: 8,
    title: "Energy Consumption Optimization",
    description: "Smart energy management using AI to reduce consumption and costs",
    category: "sustainability",
    industries: ["manufacturing", "energy", "utilities", "real-estate"],
    roi: "180",
    implementation: "Medium",
    timeline: "3-6 months",
    costSavings: "$150K-800K annually"
  },
  {
    id: 9,
    title: "Document Processing Automation",
    description: "Automated document extraction, classification, and processing",
    category: "automation",
    industries: ["finance", "healthcare", "insurance", "government", "service"],
    roi: "140",
    implementation: "Low",
    timeline: "1-3 months",
    costSavings: "$100K-600K annually"
  },
  {
    id: 10,
    title: "Price Optimization",
    description: "Dynamic pricing strategies based on market conditions and demand",
    category: "analytics",
    industries: ["retail", "hospitality", "automotive", "energy"],
    roi: "190",
    implementation: "Medium",
    timeline: "2-4 months",
    costSavings: "$250K-1.2M annually"
  }
];

const allIndustries = [
  "manufacturing", "healthcare", "finance", "retail", "technology", 
  "automotive", "energy", "utilities", "education", "government", 
  "logistics", "media", "insurance", "real-estate", "agriculture", 
  "hospitality", "construction", "engineering", "aerospace", 
  "defence", "service", "telco", "other"
];

// Basic company search function that works without OpenAI
async function searchCompaniesFallback(companyName: string) {
  // Basic known company mapping for common companies
  const knownCompanies = [
    { name: "Vodafone", industry: "telco" },
    { name: "Vodafone Group", industry: "telco" },
    { name: "Microsoft", industry: "technology" },
    { name: "Apple", industry: "technology" },
    { name: "Google", industry: "technology" },
    { name: "Amazon", industry: "retail" },
    { name: "Tesla", industry: "automotive" },
    { name: "BMW", industry: "automotive" },
    { name: "Mercedes", industry: "automotive" },
    { name: "Siemens", industry: "manufacturing" },
    { name: "General Electric", industry: "manufacturing" },
    { name: "Boeing", industry: "aerospace" },
    { name: "Airbus", industry: "aerospace" },
    { name: "ExxonMobil", industry: "energy" },
    { name: "Shell", industry: "energy" },
    { name: "JPMorgan", industry: "finance" },
    { name: "Goldman Sachs", industry: "finance" },
    { name: "Walmart", industry: "retail" },
    { name: "Pfizer", industry: "healthcare" },
    { name: "Johnson & Johnson", industry: "healthcare" }
  ];

  const searchTerm = companyName.toLowerCase();
  const matches = knownCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm) ||
    searchTerm.includes(company.name.toLowerCase())
  );

  return matches.slice(0, 5);
}

async function searchCompanies(companyName: string) {
  if (!openAIApiKey) {
    return searchCompaniesFallback(companyName);
  }

  try {
    const searchPrompt = `Search for companies similar to or matching "${companyName}". Provide up to 5 real companies that could match this search term, along with their primary industry. Focus on well-known companies that might be relevant. Format the response as a JSON array with objects containing 'name' and 'industry' fields.`;

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
            content: 'You are a business research assistant. When searching for companies, provide accurate, real company names and their industries. Always respond with valid JSON format only, no markdown formatting.' 
          },
          { role: 'user', content: searchPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI search API error:', response.status);
      return searchCompaniesFallback(companyName);
    }

    const data = await response.json();
    let searchResult = data.choices[0].message.content;
    
    // Clean up the response if it has markdown formatting
    if (searchResult.includes('```json')) {
      searchResult = searchResult.replace(/```json\n?/, '').replace(/\n?```/, '');
    }
    if (searchResult.includes('```')) {
      searchResult = searchResult.replace(/```\n?/, '').replace(/\n?```/, '');
    }
    
    try {
      const companies = JSON.parse(searchResult);
      return Array.isArray(companies) ? companies : searchCompaniesFallback(companyName);
    } catch (parseError) {
      console.error('Failed to parse company search results:', parseError);
      return searchCompaniesFallback(companyName);
    }
  } catch (error) {
    console.error('Error searching for companies:', error);
    return searchCompaniesFallback(companyName);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName } = await req.json();
    console.log('Analyzing customer:', customerName);

    // Always search for similar companies regardless of OpenAI availability
    console.log('Searching for similar companies...');
    const suggestedCompanies = await searchCompanies(customerName);
    console.log('Found suggested companies:', suggestedCompanies);

    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, returning fallback with all industries and company suggestions');
      return new Response(JSON.stringify({
        success: true,
        analysis: {
          industry: "unknown",
          confidence: "low",
          reasoning: `Unable to identify "${customerName}" in IFS customer list - Please select the industry.`,
          suggestedCategories: allIndustries,
          relevantUseCases: [],
          requiresManualSelection: true,
          suggestedCompanies: suggestedCompanies
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Analyze the company "${customerName}" and determine:
1. Their primary industry category (if identifiable)
2. Confidence level (high/medium/low/unknown) 
3. Brief reasoning for the classification
4. If confidence is not high or if you cannot identify the company, provide relevant industry options
5. Based on the industry analysis, recommend relevant AI use cases from the provided list

Available use case data for reference:
${JSON.stringify(embeddedUseCaseData, null, 2)}

IMPORTANT: If you cannot identify the company or are uncertain about the industry classification, set confidence to "unknown" and be honest about it.

Respond in this JSON format (NO MARKDOWN FORMATTING):
{
  "industry": "primary_industry_name_or_unknown",
  "confidence": "high|medium|low|unknown",
  "reasoning": "brief explanation including if company could not be identified",
  "suggestedCategories": ["industry1", "industry2", "industry3", ...],
  "relevantUseCases": [
    {
      "title": "Use Case Title",
      "description": "Tailored description for this specific industry/company",
      "category": "category_name",
      "roi": "percentage_number_only",
      "implementation": "Low|Medium|High",
      "timeline": "time_range"
    }
  ],
  "requiresManualSelection": true|false
}

Industry options: manufacturing, healthcare, finance, retail, technology, automotive, energy, utilities, education, government, logistics, media, insurance, real-estate, agriculture, hospitality, construction, engineering, aerospace, defence, service, telco, other

IMPORTANT: 
- If you cannot identify the company, set "requiresManualSelection" to true
- For relevantUseCases, recommend use cases that are genuinely applicable to the identified industry (or leave empty if industry is unknown)
- Be honest if you cannot identify the company
- Respond with valid JSON only, no markdown code blocks`;

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
            content: 'You are an expert business analyst specializing in AI use case recommendations. Be honest if you cannot identify a company. Always respond with valid JSON only, no markdown formatting.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    let aiResponse = data.choices[0].message.content;
    console.log('AI response content:', aiResponse);

    // Clean up the response if it has markdown formatting
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\n?/, '').replace(/\n?```/, '');
    }
    if (aiResponse.includes('```')) {
      aiResponse = aiResponse.replace(/```\n?/, '').replace(/\n?```/, '');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback to unknown company with all industries and company suggestions
      analysisResult = {
        industry: "unknown",
        confidence: "unknown",
        reasoning: "Could not parse AI response - please select the appropriate industry manually",
        suggestedCategories: allIndustries,
        relevantUseCases: [],
        requiresManualSelection: true,
        suggestedCompanies: suggestedCompanies
      };
    }

    // Always include suggested companies in the response
    analysisResult.suggestedCompanies = suggestedCompanies;

    // If company cannot be identified, ensure proper fallback
    if (analysisResult.confidence === 'unknown' || analysisResult.industry === 'unknown' || analysisResult.requiresManualSelection) {
      analysisResult.suggestedCategories = allIndustries;
      analysisResult.requiresManualSelection = true;
      
      // Update reasoning to be more specific about IFS customer list
      if (analysisResult.reasoning && !analysisResult.reasoning.includes('IFS customer list')) {
        analysisResult.reasoning = `Unable to identify "${customerName}" in IFS customer list - Please select the industry.`;
      }
    }

    console.log('Final analysis result:', analysisResult);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-industry function:', error);
    
    // Return fallback with all industries and company search on any error
    const { customerName } = await req.json().catch(() => ({ customerName: 'Unknown' }));
    const suggestedCompanies = await searchCompanies(customerName).catch(() => []);
    
    return new Response(JSON.stringify({
      success: true,
      analysis: {
        industry: "unknown",
        confidence: "unknown",
        reasoning: `Unable to identify "${customerName}" in IFS customer list - Please select the industry.`,
        suggestedCategories: allIndustries,
        relevantUseCases: [],
        requiresManualSelection: true,
        suggestedCompanies: suggestedCompanies
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
