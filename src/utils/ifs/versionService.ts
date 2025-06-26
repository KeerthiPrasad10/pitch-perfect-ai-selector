
// IFS Version Compatibility Service
import { getCachedModules } from './embeddedDataService';

// Get version compatibility with customer-specific details
export function getVersionCompatibility(
  baseVersion: string, // Cloud or Remote
  capability: string,
  primaryIndustry?: string,
  releaseVersion?: string
): {
  compatible: boolean;
  requiredVersion?: string;
  upgradeNeeded: boolean;
  industrySupported?: boolean;
  deploymentSupported?: boolean;
} {
  try {
    // Extract numeric version from release version for capability check
    const numericVersion = releaseVersion ? parseFloat(releaseVersion.match(/^(\d+\.\d+)/)?.[1] || '22.1') : 22.1;
    
    // Check embedded data for version requirements with industry and deployment context
    const cachedModules = getCachedModules();
    if (Object.keys(cachedModules).length > 0) {
      const relevantModules = Object.values(cachedModules).filter(module => {
        const capabilityMatch = module.mlCapabilities.includes(capability);
        const industryMatch = !primaryIndustry || !module.primaryIndustry || 
          module.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase());
        const deploymentMatch = !baseVersion || !module.baseIfsVersion || 
          module.baseIfsVersion.toLowerCase() === baseVersion.toLowerCase(); // Cloud or Remote
        return capabilityMatch && (industryMatch || deploymentMatch);
      });
      
      if (relevantModules.length > 0) {
        const requiredVersions = relevantModules.map(m => parseFloat(m.minVersion));
        const minRequiredVersion = Math.min(...requiredVersions);
        const industrySupported = relevantModules.some(m => 
          !primaryIndustry || !m.primaryIndustry || 
          m.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase())
        );
        const deploymentSupported = relevantModules.some(m => 
          !baseVersion || !m.baseIfsVersion || 
          m.baseIfsVersion.toLowerCase() === baseVersion.toLowerCase()
        );
        
        return {
          compatible: numericVersion >= minRequiredVersion,
          requiredVersion: minRequiredVersion.toString(),
          upgradeNeeded: numericVersion < minRequiredVersion,
          industrySupported,
          deploymentSupported
        };
      }
    }
    
    // No fallback version check - return not compatible if no embedded data
    console.log(`No version compatibility data found for capability: ${capability}`);
    return {
      compatible: false,
      upgradeNeeded: false,
      industrySupported: false,
      deploymentSupported: false
    };
  } catch (error) {
    return { compatible: false, upgradeNeeded: false, industrySupported: false, deploymentSupported: false };
  }
}
