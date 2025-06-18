
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getContextualIndustryRelationships } from './industry-relationships.ts';
import { searchDocumentUseCases, getDocumentInsights } from './document-search.ts';
import { getCompanyDetails, classifyCompanyIndustry } from './company-analysis.ts';
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
      
      // Get enhanced company details first
      const companyDetails = await getCompanyDetails(ifsCustomer.customer_name, true, openAIApiKey);
      
      // Get document insights to inform industry classification
      const documentInsights = await getDocumentInsights(customerName, openAIApiKey, supabase);
      
      // Use AI to determine the ACTUAL industry based on company operations
      const actualIndustry = await classifyCompanyIndustry(
        ifsCustomer.customer_name,
        companyDetails.description,
        documentInsights,
        openAIApiKey
      );
      
      console.log(`AI-determined actual industry: ${actualIndustry} (original: ${ifsCustomer.industry})`);
      
      // Get AI-driven contextual related industries using the actual industry
      const relatedIndustries = await getContextualIndustryRelationships(
        ifsCustomer.customer_name, 
        actualIndustry, 
        companyDetails.description,
        openAIApiKey,
        documentInsights
      );
      
      // Get relevant use cases from uploaded documents using the actual industry
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        actualIndustry, 
        actualIndustry,
        openAIApiKey,
        supabase
      );
      
      analysis = {
        customerType: "customer",
        industry: actualIndustry, // Use AI-determined industry
        confidence: "high",
        reasoning: `${companyDetails.formalName} is a confirmed IFS customer. Industry classification determined by AI analysis of actual business operations.`,
        currentUseCases: ifsCustomer.current_ml_usecases || [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: [],
        relatedIndustries: relatedIndustries,
        companyDetails: companyDetails
      };
    } else {
      // Company is a prospect
      console.log(`${customerName} is a prospect - analyzing with AI`);
      
      // Get enhanced company details first
      const companyDetails = await getCompanyDetails(customerName, false, openAIApiKey);
      
      // Get document insights to inform industry classification
      const documentInsights = await getDocumentInsights(customerName, openAIApiKey, supabase);
      
      // Use AI to determine the industry based on company's actual business
      const prospectIndustry = await classifyCompanyIndustry(
        customerName,
        companyDetails.description,
        documentInsights,
        openAIApiKey
      );
      
      console.log(`AI-determined prospect industry: ${prospectIndustry}`);

      const similarCompanies = await searchSimilarIFSCompanies(customerName, supabase);

      // Get document-based use cases for the prospect using AI-determined industry
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        prospectIndustry, 
        prospectIndustry,
        openAIApiKey,
        supabase
      );
      
      // Get AI-driven contextual related industries using the AI-determined industry
      const relatedIndustries = await getContextualIndustryRelationships(
        customerName, 
        prospectIndustry, 
        companyDetails.description,
        openAIApiKey,
        documentInsights
      );
      
      analysis = {
        customerType: "prospect",
        industry: prospectIndustry,
        confidence: "medium",
        reasoning: `${companyDetails.formalName} industry classification determined by AI analysis of business operations and document insights.`,
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
