
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExcelRow {
  'Module Code'?: string;
  'Module Name'?: string;
  'Description'?: string;
  'Min Version'?: string;
  'ML Capabilities'?: string;
  'Primary Industry'?: string;
  'Release Version'?: string;
  'Base IFS Version'?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName, contentType } = await req.json();

    if (!fileData) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing Excel file: ${fileName}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 back to buffer
    const buffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${jsonData.length} rows in Excel file`);

    let processedCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Skip empty rows
        if (!row['Module Code'] && !row['Module Name']) {
          continue;
        }

        // Parse ML capabilities (assuming comma-separated)
        const mlCapabilities = row['ML Capabilities'] 
          ? row['ML Capabilities'].split(',').map(cap => cap.trim()).filter(cap => cap.length > 0)
          : [];

        const mappingData = {
          module_code: row['Module Code'] || '',
          module_name: row['Module Name'] || '',
          description: row['Description'] || null,
          min_version: row['Min Version'] || null,
          ml_capabilities: mlCapabilities,
          primary_industry: row['Primary Industry'] || null,
          release_version: row['Release Version'] || null,
          base_ifs_version: row['Base IFS Version'] || null,
        };

        // Insert or update the record
        const { error } = await supabase
          .from('ifs_module_mappings')
          .upsert(mappingData, { 
            onConflict: 'module_code',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Error inserting row ${i + 1}:`, error);
          errors.push(`Row ${i + 1}: ${error.message}`);
        } else {
          processedCount++;
        }

      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError);
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    console.log(`Successfully processed ${processedCount} records`);

    const response = {
      success: true,
      recordsProcessed: processedCount,
      totalRows: jsonData.length,
      errors: errors.length > 0 ? errors : undefined
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing Excel file:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process Excel file',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
