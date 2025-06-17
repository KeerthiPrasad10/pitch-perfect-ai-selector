
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

async function searchCompanies(companyName: string) {
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
            content: 'You are a business research assistant. When searching for companies, provide accurate, real company names and their industries. Always respond with valid JSON format.' 
          },
          { role: 'user', content: searchPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI search API error:', response.status);
      return [];
    }

    const data = await response.json();
    const searchResult = data.choices[0].message.content;
    
    try {
      const companies = JSON.parse(searchResult);
      return Array.isArray(companies) ? companies : [];
    } catch (parseError) {
      console.error('Failed to parse company search results:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error searching for companies:', error);
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

    if (!openAIApiKey) {
      console.log('OpenAI API key not configured, returning fallback with all industries');
      return new Response(JSON.stringify({
        success: true,
        analysis: {
          industry: "unknown",
          confidence: "low",
          reasoning: "Unable to identify company - AI analysis unavailable. Please select the most appropriate industry from the options provided.",
          suggestedCategories: allIndustries,
          relevantUseCases: [],
          requiresManualSelection: true,
          suggestedCompanies: []
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

Respond in this JSON format:
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
- Be honest if you cannot identify the company`;

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
            content: 'You are an expert business analyst specializing in AI use case recommendations. Be honest if you cannot identify a company.' 
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

    const aiResponse = data.choices[0].message.content;
    console.log('AI response content:', aiResponse);

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback to unknown company with all industries
      analysisResult = {
        industry: "unknown",
        confidence: "unknown",
        reasoning: "Could not parse AI response - please select the appropriate industry manually",
        suggestedCategories: allIndustries,
        relevantUseCases: [],
        requiresManualSelection: true,
        suggestedCompanies: []
      };
    }

    // If company cannot be identified, search for similar companies
    if (analysisResult.confidence === 'unknown' || analysisResult.industry === 'unknown' || analysisResult.requiresManualSelection) {
      console.log('Company not identified, searching for similar companies...');
      const suggestedCompanies = await searchCompanies(customerName);
      analysisResult.suggestedCompanies = suggestedCompanies;
      analysisResult.suggestedCategories = allIndustries;
      analysisResult.requiresManualSelection = true;
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
    
    // Return fallback with all industries on any error
    return new Response(JSON.stringify({
      success: true,
      analysis: {
        industry: "unknown",
        confidence: "unknown",
        reasoning: "Analysis failed - please select the appropriate industry manually",
        suggestedCategories: allIndustries,
        relevantUseCases: [],
        requiresManualSelection: true,
        suggestedCompanies: []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
