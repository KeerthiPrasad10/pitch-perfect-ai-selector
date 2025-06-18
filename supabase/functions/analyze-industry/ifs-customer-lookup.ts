
// Check if company is an IFS customer
export async function checkIFSCustomer(companyName: string, supabase: any) {
  try {
    console.log(`Checking if ${companyName} is an IFS customer...`);
    
    // Search for exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', companyName)
      .single();

    if (!exactError && exactMatch) {
      console.log(`Found exact match: ${exactMatch.customer_name}`);
      return exactMatch;
    }

    // Search for partial matches
    const { data: partialMatches, error: partialError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', `%${companyName}%`)
      .limit(5);

    if (!partialError && partialMatches && partialMatches.length > 0) {
      console.log(`Found ${partialMatches.length} partial matches`);
      // Return the first match for now, could be enhanced with better matching logic
      return partialMatches[0];
    }

    console.log('No IFS customer match found');
    return null;
  } catch (error) {
    console.log('Error checking IFS customer:', error);
    return null;
  }
}

// Search for similar company names in IFS database
export async function searchSimilarIFSCompanies(companyName: string, supabase: any) {
  try {
    const { data: companies, error } = await supabase
      .from('ifs_customers')
      .select('customer_name, industry')
      .ilike('customer_name', `%${companyName.split(' ')[0]}%`)
      .limit(10);

    if (error) {
      console.log('Error searching similar companies:', error);
      return [];
    }

    return companies?.map(company => ({
      name: company.customer_name,
      industry: company.industry,
      isIFSCustomer: true
    })) || [];
  } catch (error) {
    console.log('Error in similar company search:', error);
    return [];
  }
}
