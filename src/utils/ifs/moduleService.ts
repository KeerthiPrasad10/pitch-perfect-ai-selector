
// IFS Module Service for Recommendations and Capabilities
import type { IFSCoreModule } from './types';
import { getModulesFromDatabase } from './directDataService';

// Get recommended IFS modules for a use case with customer-specific matching
export async function getRecommendedModules(
  useCaseCategory: string, 
  supabaseClient?: any, 
  openAIApiKey?: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string // Cloud or Remote
): Promise<IFSCoreModule[]> {
  try {
    // Use direct database query instead of embeddings
    console.log(`Getting modules for: ${useCaseCategory}, Industry: ${primaryIndustry}, Version: ${releaseVersion}, Base: ${baseIfsVersion}`);
    
    const modules = await getModulesFromDatabase(
      useCaseCategory,
      primaryIndustry,
      releaseVersion,
      baseIfsVersion
    );

    if (modules.length > 0) {
      console.log(`Found ${modules.length} modules from database for ${useCaseCategory}`);
      return modules;
    }

    // Try broader search if no exact matches
    const broaderModules = await getModulesFromDatabase(useCaseCategory);
    console.log(`Broader search found ${broaderModules.length} modules for ${useCaseCategory}`);
    
    return broaderModules;
  } catch (error) {
    console.log('Error getting recommended modules:', error);
    return [];
  }
}

// Check if a module supports a specific ML capability using direct database query
export async function isMLCapabilitySupported(moduleCode: string, capability: string, supabaseClient: any): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('ifs_module_mappings')
      .select('ml_capabilities')
      .eq('module_code', moduleCode)
      .single();

    if (error || !data) {
      return false;
    }

    return data.ml_capabilities?.includes(capability) || false;
  } catch (error) {
    console.error('Error checking ML capability support:', error);
    return false;
  }
}
