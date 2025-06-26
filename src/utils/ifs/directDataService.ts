
// Direct database service for IFS module mappings (bypassing embeddings)
import { supabase } from '@/integrations/supabase/client';
import type { IFSCoreModule } from './types';

// Get modules directly from database based on customer criteria
export async function getModulesFromDatabase(
  useCaseCategory: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string
): Promise<IFSCoreModule[]> {
  try {
    let query = supabase
      .from('ifs_module_mappings')
      .select('*');

    // Build query based on available criteria
    const filters: string[] = [];
    
    if (useCaseCategory) {
      // Use contains operator for ML capabilities array
      query = query.contains('ml_capabilities', [useCaseCategory]);
    }

    if (primaryIndustry) {
      query = query.ilike('primary_industry', `%${primaryIndustry}%`);
    }

    if (releaseVersion) {
      query = query.eq('release_version', releaseVersion);
    }

    if (baseIfsVersion) {
      query = query.eq('base_ifs_version', baseIfsVersion);
    }

    const { data, error } = await query.order('module_code');

    if (error) {
      console.error('Error fetching modules from database:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`No modules found for criteria: ${useCaseCategory}, ${primaryIndustry}, ${releaseVersion}, ${baseIfsVersion}`);
      return [];
    }

    // Convert database records to IFSCoreModule format
    const modules: IFSCoreModule[] = data.map(record => ({
      moduleCode: record.module_code,
      moduleName: record.module_name,
      description: record.description || '',
      minVersion: record.min_version || '22.1',
      mlCapabilities: record.ml_capabilities || [],
      primaryIndustry: record.primary_industry,
      releaseVersion: record.release_version,
      baseIfsVersion: record.base_ifs_version
    }));

    console.log(`Found ${modules.length} modules for use case: ${useCaseCategory}`);
    return modules;

  } catch (error) {
    console.error('Error in getModulesFromDatabase:', error);
    return [];
  }
}

// Check if specific ML capability is supported by querying database
export async function isMLCapabilitySupportedInDB(
  capability: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string
): Promise<boolean> {
  const modules = await getModulesFromDatabase(capability, primaryIndustry, releaseVersion, baseIfsVersion);
  return modules.length > 0;
}

// Get all available ML capabilities from database
export async function getAvailableCapabilities(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('ifs_module_mappings')
      .select('ml_capabilities');

    if (error || !data) {
      console.error('Error fetching capabilities:', error);
      return [];
    }

    // Flatten all ML capabilities arrays and get unique values
    const allCapabilities = data
      .flatMap(record => record.ml_capabilities || [])
      .filter((capability, index, array) => array.indexOf(capability) === index);

    return allCapabilities;
  } catch (error) {
    console.error('Error getting available capabilities:', error);
    return [];
  }
}
