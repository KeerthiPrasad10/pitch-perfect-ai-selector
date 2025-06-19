
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
      return {
        ...exactMatch,
        customer_number: exactMatch.customer_no || exactMatch.customer_number,
        software_release_version: exactMatch.ifs_software_release_version || exactMatch.software_release_version,
        ifs_version: exactMatch.ifs_version,
        deployment_type: exactMatch.ifs_version // Cloud or Remote
      };
    }

    // Search for partial matches
    const { data: partialMatches, error: partialError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', `%${companyName}%`)
      .limit(5);

    if (!partialError && partialMatches && partialMatches.length > 0) {
      console.log(`Found ${partialMatches.length} partial matches`);
      // Return the first match with additional fields
      const match = partialMatches[0];
      return {
        ...match,
        customer_number: match.customer_no || match.customer_number,
        software_release_version: match.ifs_software_release_version || match.software_release_version,
        ifs_version: match.ifs_version,
        deployment_type: match.ifs_version // Cloud or Remote
      };
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
      .select('customer_name, industry, customer_no, ifs_version, ifs_software_release_version')
      .ilike('customer_name', `%${companyName.split(' ')[0]}%`)
      .limit(10);

    if (error) {
      console.log('Error searching similar companies:', error);
      return [];
    }

    return companies?.map(company => ({
      name: company.customer_name,
      industry: company.industry,
      isIFSCustomer: true,
      customerNumber: company.customer_no || company.customer_number,
      ifsVersion: company.ifs_version,
      softwareReleaseVersion: company.ifs_software_release_version || company.software_release_version,
      deploymentType: company.ifs_version // Cloud or Remote
    })) || [];
  } catch (error) {
    console.log('Error in similar company search:', error);
    return [];
  }
}
