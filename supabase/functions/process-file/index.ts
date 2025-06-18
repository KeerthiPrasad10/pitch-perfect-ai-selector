
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
    const { filePath, fileName, fileType, fileSize } = await req.json();
    
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

    console.log(`Processing file: ${fileName}`);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Extract text from file
    let textContent = '';
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      textContent = await fileData.text();
    } else if (fileType === 'application/json') {
      const jsonData = await fileData.text();
      textContent = JSON.stringify(JSON.parse(jsonData), null, 2);
    } else {
      // For other file types, use the file name and basic metadata
      textContent = `File: ${fileName}\nType: ${fileType}\nSize: ${fileSize} bytes`;
    }

    // Split text into chunks (simple implementation)
    const chunks = chunkText(textContent, 1000); // 1000 character chunks

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding using OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: chunk,
        }),
      });

      if (!embeddingResponse.ok) {
        throw new Error(`Failed to generate embedding: ${embeddingResponse.statusText}`);
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Store embedding in database
      const { error: insertError } = await supabaseClient
        .from('file_embeddings')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_path: filePath,
          file_type: fileType,
          file_size: fileSize,
          chunk_index: i,
          chunk_text: chunk,
          embedding: embedding,
          metadata: {
            total_chunks: chunks.length,
            chunk_length: chunk.length,
          },
        });

      if (insertError) {
        console.error('Error inserting embedding:', insertError);
        throw insertError;
      }
    }

    console.log(`Successfully processed ${chunks.length} chunks for file: ${fileName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `File processed successfully. Generated ${chunks.length} embeddings.`,
        chunks: chunks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function chunkText(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim();
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no sentences found, split by characters
  if (chunks.length === 0) {
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.slice(i, i + maxChunkSize));
    }
  }
  
  return chunks;
}
