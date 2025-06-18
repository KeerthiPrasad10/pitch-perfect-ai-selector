
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getContextualIndustryRelationships } from './industry-relationships.ts';
import { searchDocumentUseCases, getDocumentInsights } from './document-search.ts';
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
      
      // Get document insights to inform industry relationships
      const documentInsights = await getDocumentInsights(customerName, openAIApiKey, supabase);
      
      // Get relevant use cases from uploaded documents
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        ifsCustomer.industry, 
        ifsCustomer.industry,
        openAIApiKey,
        supabase
      );
      
      // Get AI-driven contextual related industries using document insights
      const relatedIndustries = await getContextualIndustryRelationships(
        ifsCustomer.customer_name, 
        ifsCustomer.industry, 
        companyDetails.description,
        openAIApiKey,
        documentInsights
      );
      
      analysis = {
        customerType: "customer",
        industry: relatedIndustries[0]?.industry || ifsCustomer.industry, // Use AI-corrected industry if available
        confidence: "high",
        reasoning: `${companyDetails.formalName} is a confirmed IFS customer. Industry classification has been refined using AI analysis.`,
        currentUseCases: ifsCustomer.current_ml_usecases || [],
        documentBasedUseCases: documentUseCases,
        suggestedCompanies: [],
        relatedIndustries: relatedIndustries,
        companyDetails: companyDetails
      };
    } else {
      // Company is a prospect
      console.log(`${customerName} is a prospect - analyzing with AI and document insights`);
      
      // Get enhanced company details first
      const companyDetails = await getCompanyDetails(customerName, false, openAIApiKey);
      
      // Get document insights to inform industry classification
      const documentInsights = await getDocumentInsights(customerName, openAIApiKey, supabase);
      
      // Use AI to determine the most accurate industry based on company details and documents
      let prospectIndustry = "other";
      if (openAIApiKey) {
        try {
          const industryClassificationPrompt = `Based on the following information, determine the most accurate primary industry classification for "${customerName}":

Company details: ${companyDetails.description}
${documentInsights.length > 0 ? `\nDocument insights:\n${documentInsights.join('\n')}` : ''}

Available industries: manufacturing, energy, aerospace, construction, service, telco, healthcare, finance, retail, automotive, utilities, technology, logistics, education, other

Consider the company's actual business operations, revenue sources, and primary activities. Respond with only the industry name in lowercase.`;

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
                  content: 'You are an expert in industry classification. Analyze the provided information carefully and determine the most accurate primary industry based on actual business operations.' 
                },
                { role: 'user', content: industryClassificationPrompt }
              ],
              temperature: 0.1,
            }),
          });

          if (industryResponse.ok) {
            const industryData = await industryResponse.json();
            prospectIndustry = industryData.choices[0].message.content.trim().toLowerCase();
            console.log(`AI-determined prospect industry: ${prospectIndustry}`);
          }
        } catch (error) {
          console.log('Could not determine prospect industry with AI:', error);
        }
      }

      const similarCompanies = await searchSimilarIFSCompanies(customerName, supabase);

      // Get document-based use cases for the prospect
      documentUseCases = await searchDocumentUseCases(
        customerName, 
        prospectIndustry, 
        prospectIndustry,
        openAIApiKey,
        supabase
      );
      
      // Get AI-driven contextual related industries using document insights
      const relatedIndustries = await getContextualIndustryRelationships(
        customerName, 
        prospectIndustry, 
        companyDetails.description,
        openAIApiKey,
        documentInsights
      );
      
      analysis = {
        customerType: "prospect",
        industry: relatedIndustries[0]?.industry || prospectIndustry, // Use AI-refined industry
        confidence: "medium",
        reasoning: `${companyDetails.formalName} has been analyzed using AI and document insights for accurate industry classification.`,
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
