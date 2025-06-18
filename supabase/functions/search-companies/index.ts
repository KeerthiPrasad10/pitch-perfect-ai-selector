
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName } = await req.json();
    console.log('Searching for companies similar to:', companyName);

    if (!companyName || !companyName.trim()) {
      return new Response(JSON.stringify({
        suggestions: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search IFS customer database for similar company names
    const searchTerms = companyName.trim().split(' ').filter(term => term.length > 2);
    
    let suggestions: any[] = [];

    // Search for companies containing any of the search terms
    for (const term of searchTerms) {
      const { data: companies, error } = await supabase
        .from('ifs_customers')
        .select('customer_name, industry')
        .ilike('customer_name', `%${term}%`)
        .limit(5);

      if (!error && companies) {
        const companyResults = companies.map(company => ({
          name: company.customer_name,
          industry: company.industry,
          isIFSCustomer: true
        }));
        suggestions.push(...companyResults);
      }
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((company, index, self) => 
      index === self.findIndex(c => c.name === company.name)
    ).slice(0, 8);

    console.log(`Found ${uniqueSuggestions.length} similar companies`);

    return new Response(JSON.stringify({
      suggestions: uniqueSuggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error searching companies:', error);
    
    return new Response(JSON.stringify({
      suggestions: [],
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
