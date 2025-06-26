
// IFS Module Service for Recommendations and Capabilities
import type { IFSCoreModule } from './types';
import { supabase } from '@/integrations/supabase/client';

// Get recommended IFS modules for a use case with customer-specific matching from database
export async function getRecommendedModules(
  useCaseCategory: string, 
  supabaseClient?: any, 
  openAIApiKey?: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string // Cloud or Remote
): Promise<IFSCoreModule[]> {
  try {
    console.log(`Querying database for modules with category: ${useCaseCategory}, industry: ${primaryIndustry}, release: ${releaseVersion}, base: ${baseIfsVersion}`);
    
    // Query the ifs_module_mappings table for matching modules
    let query = supabase
      .from('ifs_module_mappings')
      .select('*')
      .contains('ml_capabilities', [useCaseCategory]);

    // Add filters based on customer criteria
    if (primaryIndustry) {
      query = query.or(`primary_industry.ilike.%${primaryIndustry}%,primary_industry.is.null`);
    }
    
    if (releaseVersion) {
      query = query.or(`release_version.eq.${releaseVersion},release_version.is.null`);
    }
    
    if (baseIfsVersion) {
      query = query.or(`base_ifs_version.eq.${baseIfsVersion},base_ifs_version.is.null`);
    }

    const { data: modules, error } = await query;

    if (error) {
      console.error('Error querying modules:', error);
      return [];
    }

    if (!modules || modules.length === 0) {
      console.log(`No modules found for use case category: ${useCaseCategory}`);
      return [];
    }

    // Transform database records to IFSCoreModule format
    const transformedModules: IFSCoreModule[] = modules.map(module => ({
      moduleCode: module.module_code,
      moduleName: module.module_name,
      description: module.description || '',
      minVersion: module.min_version || '',
      mlCapabilities: module.ml_capabilities || [],
      primaryIndustry: module.primary_industry || '',
      releaseVersion: module.release_version || '',
      baseIfsVersion: module.base_ifs_version || ''
    }));

    console.log(`Found ${transformedModules.length} matching modules`);
    return transformedModules;
  } catch (error) {
    console.error('Error getting recommended modules:', error);
    return [];
  }
}

// Check if a module supports a specific ML capability using database data
export async function isMLCapabilitySupported(moduleCode: string, capability: string): Promise<boolean> {
  try {
    const { data: module, error } = await supabase
      .from('ifs_module_mappings')
      .select('ml_capabilities')
      .eq('module_code', moduleCode)
      .single();

    if (error || !module) {
      return false;
    }

    return module.ml_capabilities?.includes(capability) || false;
  } catch (error) {
    console.error('Error checking ML capability:', error);
    return false;
  }
}

// Get customer information from database
export async function getCustomerInfo(customerName: string): Promise<any> {
  try {
    console.log(`Looking up customer: ${customerName}`);
    
    // First check the customers table
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .ilike('customer_name', `%${customerName}%`)
      .maybeSingle();

    if (customerError) {
      console.error('Error querying customers table:', customerError);
    }

    if (customer) {
      console.log(`Found customer in database:`, customer);
      return {
        customerName: customer.customer_name,
        primaryIndustry: customer.primary_industry,
        releaseVersion: customer.release_version,
        baseIfsVersion: customer.base_ifs_version,
        customerId: customer.customer_id
      };
    }

    // Also check ifs_customers table as fallback
    const { data: ifsCustomer, error: ifsError } = await supabase
      .from('ifs_customers')
      .select('*')
      .ilike('customer_name', `%${customerName}%`)
      .maybeSingle();

    if (ifsError) {
      console.error('Error querying ifs_customers table:', ifsError);
    }

    if (ifsCustomer) {
      console.log(`Found IFS customer in database:`, ifsCustomer);
      return {
        customerName: ifsCustomer.customer_name,
        primaryIndustry: ifsCustomer.industry,
        currentUseCases: ifsCustomer.current_ml_usecases || []
      };
    }

    console.log(`No customer found for: ${customerName}`);
    return null;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
  }
}
