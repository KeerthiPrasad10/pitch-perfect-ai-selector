
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
        deployment_type: exactMatch.ifs_version, // Cloud or Remote
        release_version: exactMatch.ifs_software_release_version || exactMatch.software_release_version,
        base_ifs_version: extractBaseVersion(exactMatch.ifs_software_release_version || exactMatch.software_release_version),
        primary_industry: exactMatch.primary_industry || exactMatch.industry // Add primary industry mapping
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
        deployment_type: match.ifs_version, // Cloud or Remote
        release_version: match.ifs_software_release_version || match.software_release_version,
        base_ifs_version: extractBaseVersion(match.ifs_software_release_version || match.software_release_version),
        primary_industry: match.primary_industry || match.industry // Add primary industry mapping
      };
    }

    console.log('No IFS customer match found');
    return null;
  } catch (error) {
    console.log('Error checking IFS customer:', error);
    return null;
  }
}

// Extract base version from release version (e.g., "23.1" from "23.1.5" or "22.2" from "22.2.1")
function extractBaseVersion(releaseVersion: string): string {
  if (!releaseVersion) return '';
  
  // Extract major.minor version (first two numbers)
  const versionMatch = releaseVersion.match(/^(\d+\.\d+)/);
  return versionMatch ? versionMatch[1] : releaseVersion;
}

// Check if ML capability is available based on IFS version
export function checkMLCapabilityAvailability(releaseVersion: string, baseVersion: string, mlCapability: string): {
  available: boolean;
  status: 'available' | 'not-available' | 'upgrade-required';
  minVersion?: string;
} {
  // Define ML capabilities and their minimum version requirements
  const mlCapabilities: Record<string, string> = {
    'predictive-maintenance': '22.1',
    'demand-forecasting': '22.2',
    'quality-control': '23.1',
    'supply-chain-optimization': '22.2',
    'customer-analytics': '23.1',
    'inventory-optimization': '22.1',
    'fraud-detection': '23.1',
    'sentiment-analysis': '23.1',
    'automated-classification': '22.2',
    'anomaly-detection': '22.1'
  };

  const minVersion = mlCapabilities[mlCapability];
  if (!minVersion) {
    return { available: false, status: 'not-available' };
  }

  const currentVersion = parseFloat(baseVersion);
  const requiredVersion = parseFloat(minVersion);

  if (currentVersion >= requiredVersion) {
    return { available: true, status: 'available', minVersion };
  } else {
    return { available: false, status: 'upgrade-required', minVersion };
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
      deploymentType: company.ifs_version, // Cloud or Remote
      releaseVersion: company.ifs_software_release_version || company.software_release_version,
      baseIfsVersion: extractBaseVersion(company.ifs_software_release_version || company.software_release_version)
    })) || [];
  } catch (error) {
    console.log('Error in similar company search:', error);
    return [];
  }
}
