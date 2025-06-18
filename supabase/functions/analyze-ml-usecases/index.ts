
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, customerData } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Analyzing ML use cases for industry: ${industry}`);

    // Get user's uploaded documents for context
    const { data: userDocs, error: docsError } = await supabaseClient
      .from('file_embeddings')
      .select('file_name, chunk_text')
      .eq('user_id', user.id)
      .limit(20);

    if (docsError) {
      console.error('Error fetching user documents:', docsError);
    }

    // Prepare context from user documents
    const documentContext = userDocs && userDocs.length > 0 
      ? userDocs.map(doc => `From ${doc.file_name}: ${doc.chunk_text}`).join('\n\n')
      : '';

    // IFS customer data for references
    const ifsCustomers = [
      { name: "BMW (UK) Manufacturing Limited", industry: "Manufacturing" },
      { name: "Lockheed Martin Corporation", industry: "Aerospace & Defence" },
      { name: "Hindustan Aeronautics Limited (HAL)", industry: "Aerospace & Defence" },
      { name: "Singapore Technologies Engineering Aerospace Systems", industry: "Aerospace & Defence" },
      { name: "Telstra Ltd", industry: "Telco" },
      { name: "New Fortress Energy Inc.", industry: "Energy, Utilities & Resources" },
      { name: "SSAB Europe Oy", industry: "Energy, Utilities & Resources" },
      { name: "Pilanesberg Platinum Mines", industry: "Energy, Utilities & Resources" },
      { name: "Multiplex Global Ltd", industry: "Construction & Engineering" },
      { name: "DEMATHIEU BARD GESTION", industry: "Construction & Engineering" },
      { name: "Legal & General Homes Modular Ltd", industry: "Construction & Engineering" },
      { name: "SSA MARINE, INC.", industry: "Service" },
      { name: "Exela Technologies Limited", industry: "Service" },
      { name: "MONARCH LANDSCAPE HOLDINGS, LLC.", industry: "Service" }
    ];

    // Filter customers by industry
    const industryCustomers = ifsCustomers.filter(customer => 
      customer.industry.toLowerCase().includes(industry.toLowerCase()) ||
      industry.toLowerCase().includes(customer.industry.toLowerCase().split(' ')[0])
    );

    // Generate ML use case suggestions
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
            content: `You are an AI/ML expert consultant specializing in enterprise solutions. Generate specific, actionable ML use cases based on the provided industry context and uploaded documents. Focus on practical implementations with clear ROI potential.

For each use case, provide:
1. Title (specific and actionable)
2. Description (2-3 sentences explaining the solution)
3. Category (one of: predictive-analytics, automation, optimization, quality-control, risk-management, customer-insights)
4. ROI percentage (realistic estimate)
5. Implementation complexity (Low/Medium/High)
6. Timeline (e.g., "3-6 months", "6-12 months")
7. Specific customer examples from the provided list

Return exactly 3-5 use cases in valid JSON format as an array of objects.`
          },
          {
            role: 'user',
            content: `Industry: ${industry}
            
${customerData ? `Customer Context: ${customerData}` : ''}

${documentContext ? `Document Context from uploaded files:\n${documentContext}` : ''}

Available IFS customers for references: ${JSON.stringify(industryCustomers, null, 2)}

Generate ML use cases that are specifically relevant to this industry and context. Include references to similar IFS customers who could benefit from or implement these solutions.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ML use cases: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let useCases;
    try {
      useCases = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', content);
      // Fallback to extracting JSON from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        useCases = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse use cases from AI response');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        useCases,
        documentContext: !!documentContext,
        customerReferences: industryCustomers
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-ml-usecases:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
