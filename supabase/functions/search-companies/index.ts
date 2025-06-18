
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IFS customer list for matching
const ifsCustomers = [
  { name: "AE Rodda & Son", industry: "Manufacturing" },
  { name: "AER HOLDING SAS (EUROFEU)", industry: "Manufacturing" },
  { name: "AIM METALS & ALLOYS LP", industry: "Manufacturing" },
  { name: "ALUMINUM PRECISION PRODUCTS, INC.", industry: "Manufacturing" },
  { name: "Andersen & Sons Shelling, Inc.", industry: "Manufacturing" },
  { name: "Anthesis Ltd", industry: "Service" },
  { name: "Apex Clean Energy", industry: "Energy, Utilities & Resources" },
  { name: "Arcwide France", industry: "Manufacturing" },
  { name: "Arrow Tru-Line (ATL)", industry: "Manufacturing" },
  { name: "AXIONE", industry: "Construction & Engineering" },
  { name: "Bama Gruppen AS", industry: "Service" },
  { name: "BAYKAL MAKINE SAN. VE TIC. A.S.", industry: "Manufacturing" },
  { name: "Bertel O Steen AS", industry: "Service" },
  { name: "Billerud AB", industry: "Energy, Utilities & Resources" },
  { name: "Blachotrapez Sp. z o.o.", industry: "Manufacturing" },
  { name: "BMA TEKNOLOJI A.S.", industry: "Manufacturing" },
  { name: "BMW (UK) Manufacturing Limited", industry: "Manufacturing" },
  { name: "BOCCARD SERVICES", industry: "Construction & Engineering" },
  { name: "Bonna Sabla", industry: "Manufacturing" },
  { name: "Borr Drilling Limited", industry: "Energy, Utilities & Resources" },
  { name: "BORSEN BORU SANAYI VE TIC. LTD. STI.", industry: "Energy, Utilities & Resources" },
  { name: "BPG Holdings IV Corp", industry: "Manufacturing" },
  { name: "Burt Process Equipment", industry: "Manufacturing" },
  { name: "Channel Products Acquisiton, Inc.", industry: "Manufacturing" },
  { name: "Churchill China Plc", industry: "Manufacturing" },
  { name: "Coba International Ltd", industry: "Manufacturing" },
  { name: "Cozzini LLC", industry: "Manufacturing" },
  { name: "D.H. Pace Company, Inc.", industry: "Manufacturing" },
  { name: "Debon Sp. z o. o.", industry: "Manufacturing" },
  { name: "DEMATHIEU BARD GESTION", industry: "Construction & Engineering" },
  { name: "DEMCON management & support B.V.", industry: "Manufacturing" },
  { name: "Diversified Conveyors International (DCI)", industry: "Construction & Engineering" },
  { name: "DNASTREAM Limited", industry: "Other" },
  { name: "DSL, LTD.", industry: "Manufacturing" },
  { name: "Electrix International Limited", industry: "Manufacturing" },
  { name: "Elroy Air Inc.", industry: "Aerospace & Defence" },
  { name: "Enchanted Rock", industry: "Manufacturing" },
  { name: "EOMMT", industry: "Service" },
  { name: "Exela Technologies Limited", industry: "Service" },
  { name: "Farrow and Ball", industry: "Manufacturing" },
  { name: "Figeac Aero", industry: "Aerospace & Defence" },
  { name: "Foam Supplies, Inc.", industry: "Manufacturing" },
  { name: "FOUNTAINE PAJOT", industry: "Construction & Engineering" },
  { name: "GCX Corporation", industry: "Manufacturing" },
  { name: "Global Sea Foods (Pvt) Ltd", industry: "Manufacturing" },
  { name: "GROUPE GUILLIN", industry: "Manufacturing" },
  { name: "Grupo Boticario", industry: "Manufacturing" },
  { name: "HAHN Group GmbH", industry: "Manufacturing" },
  { name: "Hamamatsu Photonics Europe GmbH", industry: "Manufacturing" },
  { name: "Heaven Hill Distilleries, Inc.", industry: "Manufacturing" },
  { name: "Hindustan Aeronautics Limited (HAL)", industry: "Aerospace & Defence" },
  { name: "Honeybee Robotics LLC", industry: "Aerospace & Defence" },
  { name: "Hydril USA Distribution LLC", industry: "Energy, Utilities & Resources" },
  { name: "Hypnos Limited", industry: "Manufacturing" },
  { name: "IMERYS MINERALS AB", industry: "Manufacturing" },
  { name: "Infranord AB", industry: "Service" },
  { name: "INNOVAL", industry: "Manufacturing" },
  { name: "Interpath Advisory", industry: "Service" },
  { name: "Iron Senergy Holding, LLC", industry: "Energy, Utilities & Resources" },
  { name: "ITI Intermodal Services, LLC", industry: "Service" },
  { name: "ITOCHU Techno-Solutions Corporation", industry: "Aerospace & Defence" },
  { name: "J&E Hall", industry: "Manufacturing" },
  { name: "JAMCO Corporation", industry: "Aerospace & Defence" },
  { name: "Jeumont Electric", industry: "Manufacturing" },
  { name: "Jones Food Company Limited", industry: "Manufacturing" },
  { name: "Karo Healthcare AB", industry: "Manufacturing" },
  { name: "Katun Corporation", industry: "Manufacturing" },
  { name: "KBR Services, LLC", industry: "Aerospace & Defence" },
  { name: "Keyware Solutions", industry: "Service" },
  { name: "Konica Minolta Business Solutions Europe GmbH", industry: "Manufacturing" },
  { name: "KYOTEC GROUP SA", industry: "Construction & Engineering" },
  { name: "Latham Pool Products, Inc.", industry: "Manufacturing" },
  { name: "Legal & General Homes Modular Ltd", industry: "Construction & Engineering" },
  { name: "LGC Science Group Holdings Limited", industry: "Manufacturing" },
  { name: "Lockheed Martin Corporation", industry: "Aerospace & Defence" },
  { name: "Lymington Precision Engineers", industry: "Manufacturing" },
  { name: "M2P Engineering Pty Ltd", industry: "Construction & Engineering" },
  { name: "Macphie Limited", industry: "Manufacturing" },
  { name: "Magnaflow", industry: "Manufacturing" },
  { name: "MAIASPACE", industry: "Aerospace & Defence" },
  { name: "MAILLEFER SA", industry: "Manufacturing" },
  { name: "Manufactura Moderna de Metales, S.A.", industry: "Manufacturing" },
  { name: "Marelec Food Technologies", industry: "Manufacturing" },
  { name: "Mattr Corporation", industry: "Manufacturing" },
  { name: "Meble Wójcik", industry: "Manufacturing" },
  { name: "MHP Management- und IT-Beratung GmbH", industry: "Other" },
  { name: "Michigan State University (FRIB)", industry: "Manufacturing" },
  { name: "Miller Castings Inc", industry: "Energy, Utilities & Resources" },
  { name: "Mir Valve Sdn. Bhd.", industry: "Manufacturing" },
  { name: "Mississippi Lime Company", industry: "Manufacturing" },
  { name: "MONARCH LANDSCAPE HOLDINGS, LLC.", industry: "Service" },
  { name: "Multiplex Global Ltd", industry: "Construction & Engineering" },
  { name: "NAGANO SCIENCE CO. LTD.", industry: "Manufacturing" },
  { name: "NAŁĘCZÓW ZDRÓJ SP Z O O", industry: "Manufacturing" },
  { name: "New Fortress Energy Inc.", industry: "Energy, Utilities & Resources" },
  { name: "Nicklereed Unlimited", industry: "Manufacturing" },
  { name: "Nordkalk", industry: "Energy, Utilities & Resources" },
  { name: "NORTH AMERICAN NETWORK, LLC.", industry: "Service" },
  { name: "OmniByte Technology", industry: "Other" },
  { name: "Paul & Co GmbH & Co KG", industry: "Manufacturing" },
  { name: "Peters Surgical Groupe", industry: "Manufacturing" },
  { name: "Pilanesberg Platinum Mines", industry: "Energy, Utilities & Resources" },
  { name: "POLYSOUDE", industry: "Manufacturing" },
  { name: "PowerGrid Services Acquisition, LLC", industry: "Energy, Utilities & Resources" },
  { name: "Prevex Oy Ab", industry: "Manufacturing" },
  { name: "Prodomax Automation", industry: "Manufacturing" },
  { name: "PT. PHC Indonesia", industry: "Manufacturing" },
  { name: "Reaction Engines Ltd", industry: "Aerospace & Defence" },
  { name: "Reden Solar", industry: "Energy, Utilities & Resources" },
  { name: "RK Industries LLC", industry: "Construction & Engineering" },
  { name: "S. A. Silva & Sons Lanka (Pvt) Ltd", industry: "Manufacturing" },
  { name: "Sami Figeac Aero Manufacturing Industry", industry: "Aerospace & Defence" },
  { name: "SANDEN RETAIL SYSTEMS CORPORATION", industry: "Service" },
  { name: "SCOOBIC HOLDING S.A.", industry: "Manufacturing" },
  { name: "Singapore Technologies Engineering Aerospace Systems", industry: "Aerospace & Defence" },
  { name: "Soil Machine Dynamics", industry: "Construction & Engineering" },
  { name: "SSA MARINE, INC.", industry: "Service" },
  { name: "SSAB Europe Oy", industry: "Energy, Utilities & Resources" },
  { name: "STANDARD PROCESS, INC.", industry: "Manufacturing" },
  { name: "Symingtons Ltd", industry: "Manufacturing" },
  { name: "Tata Consultancy Services Ltd", industry: "Other" },
  { name: "Telstra Ltd", industry: "Telco" },
  { name: "Tennsco Corporation", industry: "Manufacturing" },
  { name: "Tharsus Group Ltd", industry: "Manufacturing" },
  { name: "Thermogenics Inc.", industry: "Manufacturing" },
  { name: "Timberwise (UK) Ltd", industry: "Service" },
  { name: "TINDALL CORPORATION", industry: "Manufacturing" },
  { name: "Tomra Systems ASA", industry: "Manufacturing" },
  { name: "Tosoh Quartz, Inc.", industry: "Manufacturing" },
  { name: "Tranter", industry: "Manufacturing" },
  { name: "University of Moratuwa", industry: "Other" },
  { name: "Var4Advisory S.P.A.", industry: "Manufacturing" },
  { name: "Vitacress Ltd", industry: "Manufacturing" },
  { name: "Vode Lighting LLC", industry: "Manufacturing" },
  { name: "WJ Group Holdings Limited", industry: "Energy, Utilities & Resources" },
  { name: "Wyre Solutions Limited", industry: "Manufacturing" },
  { name: "YORKTEL", industry: "Manufacturing" }
];

function findMatchingIFSCustomers(searchTerm: string) {
  const term = searchTerm.toLowerCase();
  return ifsCustomers.filter(customer => 
    customer.name.toLowerCase().includes(term) ||
    term.includes(customer.name.toLowerCase()) ||
    customer.name.toLowerCase().split(' ').some(word => 
      word.length > 3 && term.includes(word)
    )
  ).slice(0, 5);
}

async function searchSimilarCompaniesOnline(companyName: string) {
  if (!openAIApiKey) {
    console.log('OpenAI API key not available for online search');
    return [];
  }

  try {
    const searchPrompt = `Search for real companies that are similar to or could match "${companyName}". 
    
    Provide up to 8 real, well-known companies that could be related to this search term. Include:
    - Companies with similar names
    - Companies in the same industry sector
    - Companies that might be parent companies, subsidiaries, or divisions
    - Companies that might be commonly confused with the search term
    
    For each company, provide:
    - Full official company name
    - Primary industry (use these categories: Manufacturing, Healthcare, Finance, Retail, Technology, Automotive, Energy, Utilities, Resources, Education, Government, Logistics, Media, Insurance, Real Estate, Agriculture, Hospitality, Construction, Engineering, Aerospace, Defence, Service, Telco, Other)
    
    Format as JSON array with objects containing 'name' and 'industry' fields.
    Focus on publicly known companies that would be relevant business prospects.`;

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
            content: 'You are a business research assistant. Provide accurate information about real companies and their industries. Always respond with valid JSON format only.' 
          },
          { role: 'user', content: searchPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return [];
    }

    const data = await response.json();
    let searchResult = data.choices[0].message.content;
    
    // Clean up the response if it has markdown formatting
    if (searchResult.includes('```json')) {
      searchResult = searchResult.replace(/```json\n?/, '').replace(/\n?```/, '');
    }
    
    try {
      const companies = JSON.parse(searchResult);
      return Array.isArray(companies) ? companies.slice(0, 8) : [];
    } catch (parseError) {
      console.error('Failed to parse company search results:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error in online company search:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();
    console.log('Searching for companies similar to:', companyName);

    // First, check if it matches any IFS customers
    const ifsMatches = findMatchingIFSCustomers(companyName);
    console.log('Found IFS customer matches:', ifsMatches.length);

    // Then search for similar companies online
    const onlineMatches = await searchSimilarCompaniesOnline(companyName);
    console.log('Found online company matches:', onlineMatches.length);

    // Combine results, prioritizing IFS customers
    const allSuggestions = [
      ...ifsMatches.map(customer => ({ 
        name: customer.name, 
        industry: customer.industry.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim(),
        isIFSCustomer: true 
      })),
      ...onlineMatches.map(company => ({ 
        name: company.name, 
        industry: company.industry.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim(),
        isIFSCustomer: false 
      }))
    ];

    // Remove duplicates based on company name
    const uniqueSuggestions = allSuggestions.filter((company, index, self) =>
      index === self.findIndex(c => c.name.toLowerCase() === company.name.toLowerCase())
    ).slice(0, 10);

    console.log('Returning unique suggestions:', uniqueSuggestions.length);

    return new Response(JSON.stringify({
      success: true,
      suggestions: uniqueSuggestions,
      hasIFSMatches: ifsMatches.length > 0,
      hasOnlineMatches: onlineMatches.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-companies function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
