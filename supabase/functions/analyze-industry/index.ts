
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

    // Try to read the uploaded CSV/table from storage
    let useCaseData = '';
    let csvContent = '';
    
    try {
      console.log('Attempting to read use case data from storage...');
      
      // Try different bucket names that might contain the file
      const bucketNames = ['files', 'uploads', 'documents', 'data'];
      let fileFound = false;
      
      for (const bucketName of bucketNames) {
        try {
          const { data: files, error: listError } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 100 });

          if (!listError && files && files.length > 0) {
            console.log(`Found files in ${bucketName}:`, files.map(f => f.name));
            
            // Look for CSV files or files with relevant names
            const relevantFile = files.find(file => 
              file.name.toLowerCase().endsWith('.csv') ||
              file.name.toLowerCase().includes('usecase') ||
              file.name.toLowerCase().includes('industry') ||
              file.name.toLowerCase().includes('customer') ||
              file.name.toLowerCase().includes('data')
            );

            if (relevantFile) {
              console.log(`Found relevant file: ${relevantFile.name} in bucket: ${bucketName}`);
              
              const { data: fileData, error: downloadError } = await supabase.storage
                .from(bucketName)
                .download(relevantFile.name);

              if (!downloadError && fileData) {
                csvContent = await fileData.text();
                console.log('Successfully read CSV content, length:', csvContent.length);
                console.log('First 200 characters:', csvContent.substring(0, 200));
                fileFound = true;
                break;
              } else {
                console.log('Error downloading file:', downloadError);
              }
            }
          }
        } catch (bucketError) {
          console.log(`Error accessing bucket ${bucketName}:`, bucketError.message);
        }
      }
      
      if (!fileFound) {
        console.log('No relevant CSV file found in any storage bucket');
      }
    } catch (storageError) {
      console.log('Storage access error:', storageError);
    }

    // Parse CSV content if found
    let parsedUseCases = [];
    if (csvContent) {
      try {
        // Simple CSV parsing - split by lines and then by commas
        const lines = csvContent.split('\n').filter(line => line.trim());
        const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
        console.log('CSV headers:', headers);
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            parsedUseCases.push(row);
          }
        }
        
        console.log(`Parsed ${parsedUseCases.length} use cases from CSV`);
        console.log('Sample use case:', parsedUseCases[0]);
        
        useCaseData = `
Based on the uploaded use case data, here are the available AI use cases and their descriptions:

${JSON.stringify(parsedUseCases, null, 2)}

Use this data to provide accurate industry classification and recommend the most relevant use cases with their detailed descriptions for the customer's industry.
        `;
      } catch (parseError) {
        console.log('Error parsing CSV:', parseError);
        csvContent = ''; // Reset if parsing fails
      }
    }

    // Fallback to existing customer data if no CSV found
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

Here is the industry and use case data to reference:
${finalIndustryData}

${parsedUseCases.length > 0 ? `
IMPORTANT: When selecting relevant use cases, choose from the uploaded CSV data and include their detailed descriptions. Focus on use cases that are most applicable to the identified industry. The CSV contains specific use case titles, descriptions, industries they apply to, ROI information, and implementation details.
` : ''}

Analyze the company name, consider the business context, and respond with a JSON object containing:
{
  "industry": "primary_industry_category",
  "confidence": "high|medium|low", 
  "reasoning": "brief explanation of why this industry was selected",
  "suggestedCategories": ["array", "of", "possible", "industries"],
  "relevantUseCases": [
    {
      "title": "Use Case Title",
      "description": "Detailed description from CSV",
      "category": "Use case category",
      "roi": "ROI percentage if available",
      "implementation": "Implementation complexity if available"
    }
  ]
}

Be specific and accurate. If unsure, mark confidence as "low" and provide multiple suggested categories. ${parsedUseCases.length > 0 ? 'Select the most relevant use cases from the uploaded data with their complete descriptions.' : 'Include relevant use cases from the available data.'} IMPORTANT: Return ONLY the JSON object without any markdown formatting or code blocks.`
          },
          {
            role: 'user',
            content: `Analyze the industry for this company: "${customerName}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
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
      dataSource: csvContent ? 'csv_file' : 'fallback_data',
      useCasesFound: parsedUseCases.length
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
