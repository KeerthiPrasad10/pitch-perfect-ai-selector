
// IFS Module Service for Recommendations and Capabilities
import type { IFSCoreModule } from './types';
import { 
  getEmbeddedMappingData, 
  parseEmbeddedModuleData, 
  getCachedModules, 
  setCachedModules, 
  getCachedEmbeddedData, 
  setCachedEmbeddedData 
} from './embeddedDataService';

// Get recommended IFS modules for a use case with customer-specific matching
export async function getRecommendedModules(
  useCaseCategory: string, 
  supabase?: any, 
  openAIApiKey?: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string // Cloud or Remote
): Promise<IFSCoreModule[]> {
  try {
    // Try to get data from embedded Excel sheet with customer-specific criteria
    const cacheKey = `${primaryIndustry}-${releaseVersion}-${baseIfsVersion}`;
    
    if (supabase && openAIApiKey && (!getCachedEmbeddedData() || !getCachedEmbeddedData()[cacheKey])) {
      const embeddedData = await getEmbeddedMappingData(supabase, openAIApiKey, primaryIndustry, releaseVersion, baseIfsVersion);
      if (embeddedData) {
        setCachedEmbeddedData({ [cacheKey]: embeddedData });
        setCachedModules(parseEmbeddedModuleData(embeddedData, primaryIndustry, releaseVersion, baseIfsVersion));
      }
    }
    
    // Use embedded data if available and matches customer criteria
    const cachedModules = getCachedModules();
    if (Object.keys(cachedModules).length > 0) {
      const relevantModules: IFSCoreModule[] = [];
      
      // Filter modules based on customer criteria and use case category
      Object.values(cachedModules).forEach(module => {
        const industryMatch = !primaryIndustry || !module.primaryIndustry || module.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase());
        const versionMatch = !releaseVersion || !module.releaseVersion || module.releaseVersion === releaseVersion;
        const deploymentMatch = !baseIfsVersion || !module.baseIfsVersion || module.baseIfsVersion === baseIfsVersion; // Cloud or Remote
        const capabilityMatch = module.mlCapabilities.includes(useCaseCategory);
        
        if ((industryMatch || versionMatch || deploymentMatch) && capabilityMatch) {
          relevantModules.push(module);
        }
      });
      
      if (relevantModules.length > 0) {
        return relevantModules;
      }
    }
    
    // No fallback mapping - return empty array if no embedded data found
    console.log(`No module data found for use case category: ${useCaseCategory}`);
    return [];
  } catch (error) {
    console.log('Error getting recommended modules:', error);
    return [];
  }
}

// Check if a module supports a specific ML capability using embedded data
export function isMLCapabilitySupported(moduleCode: string, capability: string): boolean {
  const cachedModules = getCachedModules();
  const module = cachedModules[moduleCode];
  return module ? module.mlCapabilities.includes(capability) : false;
}
