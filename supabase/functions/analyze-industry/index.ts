
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Embedded CSV data for use cases - this ensures consistent access to the data
const EMBEDDED_USE_CASES = [
  {
    "Use Case Title": "Predictive Maintenance for Manufacturing Equipment",
    "Description": "Use AI to predict when manufacturing equipment will fail, allowing for proactive maintenance scheduling and reducing unexpected downtime.",
    "Industry": "Manufacturing",
    "Category": "Predictive Analytics",
    "ROI Percentage": "25-40%",
    "Implementation Complexity": "Medium",
    "Timeline": "3-6 months"
  },
  {
    "Use Case Title": "Quality Control Automation",
    "Description": "Implement computer vision AI to automatically detect defects in products during manufacturing, improving quality and reducing waste.",
    "Industry": "Manufacturing",
    "Category": "Computer Vision",
    "ROI Percentage": "20-35%",
    "Implementation Complexity": "Medium",
    "Timeline": "2-4 months"
  },
  {
    "Use Case Title": "Supply Chain Optimization",
    "Description": "Use AI to optimize inventory levels, predict demand, and streamline supply chain operations across multiple locations.",
    "Industry": "Manufacturing",
    "Category": "Supply Chain",
    "ROI Percentage": "15-30%",
    "Implementation Complexity": "High",
    "Timeline": "6-12 months"
  },
  {
    "Use Case Title": "Energy Consumption Optimization",
    "Description": "Deploy AI to monitor and optimize energy usage in manufacturing facilities, reducing costs and environmental impact.",
    "Industry": "Energy, Utilities & Resources",
    "Category": "Energy Management",
    "ROI Percentage": "20-45%",
    "Implementation Complexity": "Medium",
    "Timeline": "3-6 months"
  },
  {
    "Use Case Title": "Predictive Asset Management",
    "Description": "Use AI to predict failures in energy infrastructure like turbines, transformers, and pipelines before they occur.",
    "Industry": "Energy, Utilities & Resources",
    "Category": "Predictive Analytics",
    "ROI Percentage": "30-50%",
    "Implementation Complexity": "High",
    "Timeline": "6-9 months"
  },
  {
    "Use Case Title": "Smart Grid Management",
    "Description": "Implement AI to optimize power distribution, balance load, and integrate renewable energy sources efficiently.",
    "Industry": "Energy, Utilities & Resources",
    "Category": "Grid Optimization",
    "ROI Percentage": "25-40%",
    "Implementation Complexity": "High",
    "Timeline": "9-18 months"
  },
  {
    "Use Case Title": "Project Timeline Optimization",
    "Description": "Use AI to analyze historical project data and optimize construction schedules, resource allocation, and risk management.",
    "Industry": "Construction & Engineering",
    "Category": "Project Management",
    "ROI Percentage": "15-25%",
    "Implementation Complexity": "Medium",
    "Timeline": "3-6 months"
  },
  {
    "Use Case Title": "Safety Risk Assessment",
    "Description": "Deploy AI-powered computer vision to monitor construction sites for safety violations and potential hazards in real-time.",
    "Industry": "Construction & Engineering",
    "Category": "Safety & Compliance",
    "ROI Percentage": "20-35%",
    "Implementation Complexity": "Medium",
    "Timeline": "2-4 months"
  },
  {
    "Use Case Title": "Automated Design Optimization",
    "Description": "Use AI to optimize engineering designs for efficiency, cost, and sustainability while maintaining structural integrity.",
    "Industry": "Construction & Engineering",
    "Category": "Design Optimization",
    "ROI Percentage": "18-30%",
    "Implementation Complexity": "High",
    "Timeline": "6-12 months"
  },
  {
    "Use Case Title": "Flight Operations Optimization",
    "Description": "Use AI to optimize flight paths, fuel consumption, and maintenance schedules for aircraft operations.",
    "Industry": "Aerospace & Defence",
    "Category": "Operations Optimization",
    "ROI Percentage": "20-35%",
    "Implementation Complexity": "High",
    "Timeline": "9-15 months"
  },
  {
    "Use Case Title": "Predictive Maintenance for Aircraft",
    "Description": "Implement AI to predict component failures in aircraft, optimizing maintenance schedules and ensuring safety.",
    "Industry": "Aerospace & Defence",
    "Category": "Predictive Analytics",
    "ROI Percentage": "25-40%",
    "Implementation Complexity": "High",
    "Timeline": "12-18 months"
  },
  {
    "Use Case Title": "Defense Intelligence Analysis",
    "Description": "Deploy AI to analyze satellite imagery, communications, and other intelligence data for strategic decision-making.",
    "Industry": "Aerospace & Defence",
    "Category": "Intelligence Analytics",
    "ROI Percentage": "30-50%",
    "Implementation Complexity": "High",
    "Timeline": "12-24 months"
  },
  {
    "Use Case Title": "Customer Service Automation",
    "Description": "Implement AI chatbots and virtual assistants to handle routine customer inquiries and support requests.",
    "Industry": "Service",
    "Category": "Customer Experience",
    "ROI Percentage": "25-40%",
    "Implementation Complexity": "Low",
    "Timeline": "1-3 months"
  },
  {
    "Use Case Title": "Workforce Scheduling Optimization",
    "Description": "Use AI to optimize staff scheduling based on demand patterns, employee preferences, and operational requirements.",
    "Industry": "Service",
    "Category": "Workforce Management",
    "ROI Percentage": "15-25%",
    "Implementation Complexity": "Medium",
    "Timeline": "2-4 months"
  },
  {
    "Use Case Title": "Personalized Service Recommendations",
    "Description": "Deploy AI to analyze customer behavior and preferences to provide personalized service recommendations.",
    "Industry": "Service",
    "Category": "Personalization",
    "ROI Percentage": "20-30%",
    "Implementation Complexity": "Medium",
    "Timeline": "3-6 months"
  },
  {
    "Use Case Title": "Network Performance Optimization",
    "Description": "Use AI to monitor and optimize telecommunications network performance, reducing latency and improving service quality.",
    "Industry": "Telco",
    "Category": "Network Optimization",
    "ROI Percentage": "20-35%",
    "Implementation Complexity": "High",
    "Timeline": "6-12 months"
  },
  {
    "Use Case Title": "Predictive Network Maintenance",
    "Description": "Implement AI to predict network equipment failures and optimize maintenance schedules to prevent outages.",
    "Industry": "Telco",
    "Category": "Predictive Analytics",
    "ROI Percentage": "25-40%",
    "Implementation Complexity": "High",
    "Timeline": "6-9 months"
  },
  {
    "Use Case Title": "Customer Churn Prediction",
    "Description": "Use AI to identify customers at risk of churning and implement targeted retention strategies.",
    "Industry": "Telco",
    "Category": "Customer Analytics",
    "ROI Percentage": "18-30%",
    "Implementation Complexity": "Medium",
    "Timeline": "3-6 months"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName } = await req.json();
    console.log('Analyzing industry for customer:', customerName);

    if (!customerName) {
      throw new Error('Customer name is required');
    }

    const openAIApiKey = Deno.env.get('NEXUS-BLACK-INTERNAL-OpenAI-EASTUS2');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Customer data for industry classification
    const customerData = `
    AE Rodda & Son - Manufacturing
    EUROFEU - Manufacturing
    American Iron & Metal - Manufacturing
    Aluminum Precision Products - Manufacturing
    Andersen & Sons Shelling - Manufacturing
    Anthesis Ltd - Service
    Apex Clean Energy - Energy, Utilities & Resources
    Arrow Tru-Line - Manufacturing
    AXIONE - Construction & Engineering
    Bama Gruppen AS - Service
    BAYKAL MAKINE - Manufacturing
    Bertel O Steen AS - Service
    Billerud AB - Energy, Utilities & Resources
    Blachotrapez - Manufacturing
    BMA TEKNOLOJI - Manufacturing
    BMW UK Manufacturing - Manufacturing
    BOCCARD SERVICES - Construction & Engineering
    Bonna Sabla - Manufacturing
    Borr Drilling Limited - Energy, Utilities & Resources
    BORSEN BORU SANAYI - Energy, Utilities & Resources
    BPG Holdings - Manufacturing
    Burt Process Equipment - Manufacturing
    Channel Products - Manufacturing
    Churchill China - Manufacturing
    Coba International - Manufacturing
    Cozzini LLC - Manufacturing
    D.H. Pace Company - Manufacturing
    Debon - Manufacturing
    DEMATHIEU BARD GESTION - Construction & Engineering
    DEMCON - Manufacturing
    Diversified Conveyors - Construction & Engineering
    DSL, LTD - Manufacturing
    Electrix International - Manufacturing
    Elroy Air - Aerospace & Defence
    Enchanted Rock - Manufacturing
    Farrow and Ball - Manufacturing
    Figeac Aero - Aerospace & Defence
    Foam Supplies - Manufacturing
    FOUNTAINE PAJOT - Construction & Engineering
    GCX Corporation - Manufacturing
    Global Sea Foods - Manufacturing
    GROUPE GUILLIN - Manufacturing
    Grupo Boticario - Manufacturing
    HAHN Group - Manufacturing
    Hamamatsu Photonics - Manufacturing
    Heaven Hill Distilleries - Manufacturing
    Hindustan Aeronautics Limited - Aerospace & Defence
    Honeybee Robotics - Aerospace & Defence
    Hydril USA Distribution - Energy, Utilities & Resources
    Hypnos Limited - Manufacturing
    IMERYS MINERALS - Manufacturing
    Infranord AB - Service
    INNOVAL - Manufacturing
    Interpath Advisory - Service
    Iron Senergy Holding - Energy, Utilities & Resources
    ITI Intermodal Services - Service
    ITOCHU Techno-Solutions - Aerospace & Defence
    J&E Hall - Manufacturing
    JAMCO Corporation - Aerospace & Defence
    Jeumont Electric - Manufacturing
    Jones Food Company - Manufacturing
    Karo Healthcare - Manufacturing
    Katun Corporation - Manufacturing
    KBR Services - Aerospace & Defence
    Konica Minolta - Manufacturing
    KYOTEC GROUP - Construction & Engineering
    Latham Pool Products - Manufacturing
    Legal & General Homes - Construction & Engineering
    LGC Science Group - Manufacturing
    Lockheed Martin - Aerospace & Defence
    Lymington Precision Engineers - Manufacturing
    M2P Engineering - Construction & Engineering
    Macphie Limited - Manufacturing
    Magnaflow - Manufacturing
    MAIASPACE - Aerospace & Defence
    MAILLEFER SA - Manufacturing
    Manufactura Moderna de Metales - Manufacturing
    Marelec Food Technologies - Manufacturing
    Mattr Corporation - Manufacturing
    Michigan State University - Manufacturing
    Miller Castings - Energy, Utilities & Resources
    Mir Valve - Manufacturing
    Mississippi Lime Company - Manufacturing
    MONARCH LANDSCAPE HOLDINGS - Service
    Multiplex Global - Construction & Engineering
    NAGANO SCIENCE - Manufacturing
    NAŁĘCZÓW ZDRÓJ - Manufacturing
    New Fortress Energy - Energy, Utilities & Resources
    Nicklereed Unlimited - Manufacturing
    Nordkalk - Energy, Utilities & Resources
    Paul & Co - Manufacturing
    Peters Surgical Groupe - Manufacturing
    Pilanesberg Platinum Mines - Energy, Utilities & Resources
    POLYSOUDE - Manufacturing
    PowerGrid Services - Energy, Utilities & Resources
    Prevex Oy Ab - Manufacturing
    Prodomax Automation - Manufacturing
    PT. PHC Indonesia - Manufacturing
    Reaction Engines - Aerospace & Defence
    Reden Solar - Energy, Utilities & Resources
    RK Industries - Construction & Engineering
    S. A. Silva & Sons Lanka - Manufacturing
    Sami Figeac Aero Manufacturing - Aerospace & Defence
    SANDEN RETAIL SYSTEMS - Service
    SCOOBIC HOLDING - Manufacturing
    Singapore Technologies Engineering - Aerospace & Defence
    Soil Machine Dynamics - Construction & Engineering
    SSA MARINE - Service
    SSAB Europe - Energy, Utilities & Resources
    STANDARD PROCESS - Manufacturing
    Symingtons Ltd - Manufacturing
    Tata Consultancy Services - Other
    Telstra Ltd - Telco
    Tennsco Corporation - Manufacturing
    Tharsus Group - Manufacturing
    Thermogenics - Manufacturing
    Timberwise UK - Service
    TINDALL CORPORATION - Manufacturing
    Tomra Systems - Manufacturing
    Tosoh Quartz - Manufacturing
    Tranter - Manufacturing
    University of Moratuwa - Other
    Var4Advisory - Manufacturing
    Vitacress Ltd - Manufacturing
    Vode Lighting - Manufacturing
    WJ Group Holdings - Energy, Utilities & Resources
    Wyre Solutions - Manufacturing
    YORKTEL - Manufacturing
    `;

    // Prepare use case data for the LLM
    const useCaseDataString = JSON.stringify(EMBEDDED_USE_CASES, null, 2);

    console.log('Using gpt-4o deployment with embedded use case data');
    const response = await fetch('https://nexus-black-internal-eastus2.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are an industry classification expert for IFS, a leading enterprise software company. Your task is to analyze company names and determine their primary industry category.

Based on the company name provided, classify it into one of these industry categories:
- Manufacturing
- Energy, Utilities & Resources  
- Construction & Engineering
- Aerospace & Defence
- Service
- Telco
- Other

Here is the customer industry reference data:
${customerData}

Here is the comprehensive AI use case data that you MUST use for recommendations:
${useCaseDataString}

IMPORTANT: When selecting relevant use cases, you MUST choose from the embedded use case data above. Select use cases that match the identified industry and provide their complete details including title, description, ROI percentage, implementation complexity, and timeline.

Analyze the company name, consider the business context, and respond with a JSON object containing:
{
  "industry": "primary_industry_category",
  "confidence": "high|medium|low", 
  "reasoning": "brief explanation of why this industry was selected",
  "suggestedCategories": ["array", "of", "possible", "industries"],
  "relevantUseCases": [
    {
      "title": "Use Case Title from embedded data",
      "description": "Complete description from embedded data",
      "category": "Use case category",
      "roi": "ROI percentage from embedded data",
      "implementation": "Implementation complexity from embedded data",
      "timeline": "Timeline from embedded data"
    }
  ]
}

Be specific and accurate. If unsure, mark confidence as "low" and provide multiple suggested categories. Select the 2-3 most relevant use cases from the embedded data that match the identified industry. IMPORTANT: Return ONLY the JSON object without any markdown formatting or code blocks.`
          },
          {
            role: 'user',
            content: `Analyze the industry for this company: "${customerName}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response:', data);
    
    let content = data.choices[0].message.content;
    console.log('Analysis result:', content);

    // Clean up markdown code blocks if present
    if (content.includes('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
      console.log('Cleaned content:', content);
    }

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content:', content);
      // Fallback parsing if JSON is not perfect
      analysisResult = {
        industry: "Other",
        confidence: "low",
        reasoning: "Could not parse AI response properly",
        suggestedCategories: ["Manufacturing", "Service", "Other"],
        relevantUseCases: []
      };
    }

    return new Response(JSON.stringify({
      success: true,
      customerName,
      analysis: analysisResult,
      dataSource: 'embedded_data',
      useCasesFound: EMBEDDED_USE_CASES.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-industry function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
