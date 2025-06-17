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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName } = await req.json();
    console.log('Analyzing customer:', customerName);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze the company "${customerName}" and determine:
1. Their primary industry category
2. Confidence level (high/medium/low) 
3. Brief reasoning for the classification
4. Up to 3 alternative industry suggestions if confidence is not high
5. Based on the industry analysis, recommend ALL relevant AI use cases from the provided list that would be most valuable for this company. Don't limit to just a few - provide comprehensive recommendations that are truly justified.

Available use case data for reference:
${JSON.stringify(embeddedUseCaseData, null, 2)}

Respond in this JSON format:
{
  "industry": "primary_industry_name",
  "confidence": "high|medium|low",
  "reasoning": "brief explanation",
  "suggestedCategories": ["industry1", "industry2", "industry3"],
  "relevantUseCases": [
    {
      "title": "Use Case Title",
      "description": "Tailored description for this specific industry/company",
      "category": "category_name",
      "roi": "percentage_number_only",
      "implementation": "Low|Medium|High",
      "timeline": "time_range"
    }
  ]
}

Industry options: manufacturing, healthcare, finance, retail, technology, automotive, energy, utilities, education, government, logistics, media, insurance, real-estate, agriculture, hospitality, construction, engineering, aerospace, defence, service, telco, other

IMPORTANT: For relevantUseCases, recommend ALL use cases that are genuinely applicable to this industry. If a company in manufacturing could benefit from predictive maintenance, quality control, demand forecasting, supply chain optimization, and energy optimization - recommend all of them. Don't artificially limit the recommendations.`;

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
            content: 'You are an expert business analyst specializing in AI use case recommendations. Provide comprehensive, justified recommendations without artificial limits.' 
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
      throw new Error('Failed to parse AI analysis');
    }

    console.log('Parsed analysis result:', analysisResult);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-industry function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
