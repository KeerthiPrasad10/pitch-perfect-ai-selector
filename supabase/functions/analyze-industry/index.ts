
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration not found');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to read the uploaded table from storage
    let industryData = '';
    let useCaseData = '';
    
    try {
      console.log('Attempting to read industry data from storage...');
      
      // List files in the default bucket to find the uploaded table
      const { data: files, error: listError } = await supabase.storage
        .from('files')
        .list('', { limit: 100 });

      if (listError) {
        console.log('Error listing files:', listError);
      } else {
        console.log('Found files:', files?.map(f => f.name));
        
        // Look for common table file extensions
        const tableFile = files?.find(file => 
          file.name.toLowerCase().includes('industry') || 
          file.name.toLowerCase().includes('usecase') ||
          file.name.toLowerCase().endsWith('.csv') ||
          file.name.toLowerCase().endsWith('.json')
        );

        if (tableFile) {
          console.log('Found table file:', tableFile.name);
          
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('files')
            .download(tableFile.name);

          if (!downloadError && fileData) {
            const fileContent = await fileData.text();
            console.log('Successfully read file content, length:', fileContent.length);
            
            if (tableFile.name.toLowerCase().endsWith('.json')) {
              try {
                const jsonData = JSON.parse(fileContent);
                industryData = JSON.stringify(jsonData, null, 2);
              } catch (parseError) {
                console.log('JSON parse error:', parseError);
                industryData = fileContent;
              }
            } else {
              industryData = fileContent;
            }
            
            useCaseData = `
Based on the uploaded industry data, here are the enhanced industry classifications and use cases:

${industryData}

Use this data to provide more accurate industry classification and relevant use cases for the customer.
            `;
          } else {
            console.log('Error downloading file:', downloadError);
          }
        } else {
          console.log('No suitable table file found in storage');
        }
      }
    } catch (storageError) {
      console.log('Storage access error:', storageError);
    }

    // Fallback to existing customer data if no file found
    const fallbackCustomerData = `
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

    const finalIndustryData = useCaseData || fallbackCustomerData;

    console.log('Using gpt-4o deployment');
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

Here is the industry data and use case information to reference:
${finalIndustryData}

Analyze the company name, consider the business context, and respond with a JSON object containing:
{
  "industry": "primary_industry_category",
  "confidence": "high|medium|low", 
  "reasoning": "brief explanation of why this industry was selected",
  "suggestedCategories": ["array", "of", "possible", "industries"],
  "relevantUseCases": ["array", "of", "relevant", "use", "cases", "from", "the", "data"]
}

Be specific and accurate. If unsure, mark confidence as "low" and provide multiple suggested categories. Include relevant use cases from the uploaded data if available.`
          },
          {
            role: 'user',
            content: `Analyze the industry for this company: "${customerName}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response:', data);
    
    const content = data.choices[0].message.content;
    console.log('Analysis result:', content);

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
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
      dataSource: useCaseData ? 'uploaded_table' : 'fallback_data'
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
