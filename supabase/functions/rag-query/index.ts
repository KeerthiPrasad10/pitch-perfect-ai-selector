
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
    const { query, maxResults = 5 } = await req.json();
    
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

    console.log(`Processing RAG query: ${query}`);

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`Failed to generate query embedding: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar embeddings
    const { data: similarDocs, error: searchError } = await supabaseClient
      .rpc('search_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: maxResults,
        filter_user_id: user.id
      });

    if (searchError) {
      throw new Error(`Search failed: ${searchError.message}`);
    }

    if (!similarDocs || similarDocs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          answer: "I couldn't find any relevant information in your uploaded documents to answer that question.",
          sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context from similar documents
    const context = similarDocs
      .map((doc: any) => `From ${doc.file_name}: ${doc.chunk_text}`)
      .join('\n\n');

    // Generate answer using OpenAI with context
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a helpful assistant that answers questions based on the provided context from uploaded documents. 
            Use only the information provided in the context to answer questions. 
            If the context doesn't contain enough information to answer the question, say so clearly.
            Always cite which document the information comes from when possible.`
          },
          {
            role: 'user',
            content: `Context from uploaded documents:\n\n${context}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Failed to generate answer: ${chatResponse.statusText}`);
    }

    const chatData = await chatResponse.json();
    const answer = chatData.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true,
        answer,
        sources: similarDocs.map((doc: any) => ({
          file_name: doc.file_name,
          similarity: doc.similarity,
          chunk_text: doc.chunk_text.substring(0, 200) + '...'
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in RAG query:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
