
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getContextualIndustryRelationships } from './industry-relationships.ts';
import { searchDocumentUseCases } from './document-search.ts';
import { getCompanyDetails } from './company-analysis.ts';
import { checkIFSCustomer, searchSimilarIFSCompanies } from './ifs-customer-lookup.ts';
import type { CustomerAnalysis } from './types.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    const { customerName } = await req.json();
    console.log('Analyzing customer:', customerName);

    // Check if company is an IFS customer
    const ifsCustomer = await checkIFSCustomer(customerName, supabase);
    
    let analysis: CustomerAnalysis;
    let documentUseCases: any[] = [];

    if (ifsCustomer) {
      // Company is an IFS customer
      console.log(`${customerName} is an IFS customer in ${ifsCustomer.industry} industry`);
      
      // Get enhanced company details
      const companyDetails = await getCompanyDetails(ifsCustomer.customer_name, true, openAIApiKey);
      
      // Get relevant use cases from uploaded documents
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        ifsCustomer.industry, 
        ifsCustomer.industry,
        openAIApiKey,
        supabase
      );
      
      // Get contextual related industries and their use cases
      const relatedIndustries = await getContextualIndustryRelationships(
        ifsCustomer.customer_name, 
        ifsCustomer.industry, 
        companyDetails.description,
        openAIApiKey
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
      
      const similarCompanies = await searchSimilarIFSCompanies(customerName, supabase);
      
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
      const companyDetails = await getCompanyDetails(customerName, false, openAIApiKey);

      // Get document-based use cases for the prospect
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        prospectIndustry, 
        prospectIndustry,
        openAIApiKey,
        supabase
      );
      
      // Get contextual related industries and their use cases
      const relatedIndustries = await getContextualIndustryRelationships(
        customerName, 
        prospectIndustry, 
        companyDetails.description,
        openAIApiKey
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
