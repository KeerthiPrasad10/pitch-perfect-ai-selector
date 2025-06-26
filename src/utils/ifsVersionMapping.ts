// IFS Version and Module Mapping Utilities - Using Embedded Excel Data
export interface IFSVersionInfo {
  baseVersion: string; // Cloud or Remote
  releaseVersion: string;
  deploymentType: 'Cloud' | 'Remote';
  supportedMLCapabilities: string[];
}

export interface IFSCoreModule {
  moduleCode: string;
  moduleName: string;
  description: string;
  minVersion: string;
  mlCapabilities: string[];
  primaryIndustry?: string;
  releaseVersion?: string;
  baseIfsVersion?: string; // Cloud or Remote
}

// Cache for embedded data to avoid repeated API calls
let cachedEmbeddedData: any = null;
let cachedModules: Record<string, IFSCoreModule> = {};

// Get IFS module and version data from embedded Excel sheet with industry matching
async function getEmbeddedMappingData(
  supabase: any, 
  openAIApiKey?: string,
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string // Cloud or Remote
): Promise<any> {
  try {
    if (!openAIApiKey || !supabase) {
      return null;
    }

    // Create embedding for more specific search including customer details
    const searchQuery = `IFS modules AI ML capabilities version mapping ${primaryIndustry || ''} ${releaseVersion || ''} ${baseIfsVersion || ''} core modules manufacturing SCM CRM EAM finance HCM project management`;
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: searchQuery,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!embeddingResponse.ok) {
      return null;
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for IFS mapping data in embedded Excel sheet
    const { data: searchResults, error } = await supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 15 // Increased to get more comprehensive results
    });

    if (error || !searchResults || searchResults.length === 0) {
      return null;
    }

    return searchResults;
  } catch (error) {
    console.log('Error fetching embedded mapping data:', error);
    return null;
  }
}

// Parse embedded Excel data to extract IFS module information with customer-specific matching
function parseEmbeddedModuleData(
  embeddedData: any[], 
  primaryIndustry?: string,
  releaseVersion?: string,
  baseIfsVersion?: string // Cloud or Remote
): Record<string, IFSCoreModule> {
  const modules: Record<string, IFSCoreModule> = {};
  
  // Extract module information from embedded Excel data
  embeddedData.forEach(chunk => {
    const text = chunk.chunk_text.toLowerCase();
    
    // Check if this chunk is relevant to the customer's industry, version, and deployment type
    const industryMatch = !primaryIndustry || text.includes(primaryIndustry.toLowerCase());
    const versionMatch = !releaseVersion || text.includes(releaseVersion);
    const deploymentMatch = !baseIfsVersion || text.includes(baseIfsVersion.toLowerCase()); // Cloud or Remote
    
    // Only process if it matches customer criteria
    if (!industryMatch && !versionMatch && !deploymentMatch && primaryIndustry) {
      return; // Skip if not relevant to customer
    }
    
    // Look for module patterns in the embedded data
    if (text.includes('manufacturing') || text.includes('manuf')) {
      modules['MANUF'] = {
        moduleCode: 'MANUF',
        moduleName: 'Manufacturing',
        description: 'Production planning, scheduling, and shop floor management',
        minVersion: extractVersionFromText(text) || '22.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['predictive-maintenance', 'quality-control', 'production-optimization']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('supply chain') || text.includes('scm')) {
      modules['SCM'] = {
        moduleCode: 'SCM',
        moduleName: 'Supply Chain Management',
        description: 'Procurement, inventory, and logistics management',
        minVersion: extractVersionFromText(text) || '22.2',
        mlCapabilities: extractCapabilitiesFromText(text, ['demand-forecasting', 'inventory-optimization', 'supplier-analytics']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('customer relationship') || text.includes('crm')) {
      modules['CRM'] = {
        moduleCode: 'CRM',
        moduleName: 'Customer Relationship Management',
        description: 'Sales, marketing, and customer service',
        minVersion: extractVersionFromText(text) || '23.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['customer-analytics', 'sentiment-analysis', 'lead-scoring']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('enterprise asset') || text.includes('eam')) {
      modules['EAM'] = {
        moduleCode: 'EAM',
        moduleName: 'Enterprise Asset Management',
        description: 'Asset lifecycle and maintenance management',
        minVersion: extractVersionFromText(text) || '22.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['predictive-maintenance', 'anomaly-detection', 'asset-optimization']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('financial') || text.includes('finance')) {
      modules['FINANCE'] = {
        moduleCode: 'FINANCE',
        moduleName: 'Financial Management',
        description: 'Accounting, budgeting, and financial reporting',
        minVersion: extractVersionFromText(text) || '22.2',
        mlCapabilities: extractCapabilitiesFromText(text, ['fraud-detection', 'financial-forecasting', 'automated-classification']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('human capital') || text.includes('hcm') || text.includes('hr')) {
      modules['HCM'] = {
        moduleCode: 'HCM',
        moduleName: 'Human Capital Management',
        description: 'HR processes and workforce management',
        minVersion: extractVersionFromText(text) || '23.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['employee-analytics', 'recruitment-optimization', 'performance-prediction']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('project management') || text.includes('project')) {
      modules['PROJECT'] = {
        moduleCode: 'PROJECT',
        moduleName: 'Project Management',
        description: 'Project planning, execution, and portfolio management',
        minVersion: extractVersionFromText(text) || '22.2',
        mlCapabilities: extractCapabilitiesFromText(text, ['project-risk-analysis', 'resource-optimization', 'timeline-prediction']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
  });
  
  return modules;
}

// Extract version information from embedded text
function extractVersionFromText(text: string): string | null {
  const versionPattern = /(\d+\.\d+)/g;
  const matches = text.match(versionPattern);
  return matches ? matches[0] : null;
}

// Extract industry information from embedded text
function extractIndustryFromText(text: string): string | null {
  const industries = ['manufacturing', 'healthcare', 'retail', 'finance', 'automotive', 'energy', 'aerospace', 'construction'];
  for (const industry of industries) {
    if (text.includes(industry)) {
      return industry;
    }
  }
  return null;
}

// Extract capabilities from embedded text
function extractCapabilitiesFromText(text: string, possibleCapabilities: string[]): string[] {
  const capabilities: string[] = [];
  possibleCapabilities.forEach(cap => {
    if (text.includes(cap.replace('-', ' ')) || text.includes(cap)) {
      capabilities.push(cap);
    }
  });
  return capabilities;
}

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
    
    if (supabase && openAIApiKey && (!cachedEmbeddedData || !cachedEmbeddedData[cacheKey])) {
      const embeddedData = await getEmbeddedMappingData(supabase, openAIApiKey, primaryIndustry, releaseVersion, baseIfsVersion);
      if (embeddedData) {
        cachedEmbeddedData = { [cacheKey]: embeddedData };
        cachedModules = parseEmbeddedModuleData(embeddedData, primaryIndustry, releaseVersion, baseIfsVersion);
      }
    }
    
    // Use embedded data if available and matches customer criteria
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
    
    // Fallback to basic mapping if no embedded data found
    const fallbackMapping: Record<string, string[]> = {
      'predictive-maintenance': ['MANUF', 'EAM'],
      'quality-control': ['MANUF'],
      'demand-forecasting': ['SCM'],
      'inventory-optimization': ['SCM'],
      'customer-analytics': ['CRM'],
      'sentiment-analysis': ['CRM'],
      'fraud-detection': ['FINANCE'],
      'anomaly-detection': ['EAM', 'MANUF'],
      'automated-classification': ['FINANCE', 'SCM'],
      'supply-chain-optimization': ['SCM'],
      'production-optimization': ['MANUF'],
      'financial-forecasting': ['FINANCE'],
      'employee-analytics': ['HCM'],
      'project-risk-analysis': ['PROJECT'],
      'asset-optimization': ['EAM']
    };
    
    const moduleKeys = fallbackMapping[useCaseCategory] || [];
    const fallbackModules = moduleKeys.map(key => ({
      moduleCode: key,
      moduleName: key,
      description: `${key} module`,
      minVersion: '22.1',
      mlCapabilities: [useCaseCategory]
    }));
    
    return fallbackModules;
  } catch (error) {
    console.log('Error getting recommended modules:', error);
    return [];
  }
}

// Check if a module supports a specific ML capability using embedded data
export function isMLCapabilitySupported(moduleCode: string, capability: string): boolean {
  const module = cachedModules[moduleCode];
  return module ? module.mlCapabilities.includes(capability) : false;
}

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
    
    // Fallback version check
    const minVersion = 22.1;
    return {
      compatible: numericVersion >= minVersion,
      requiredVersion: minVersion.toString(),
      upgradeNeeded: numericVersion < minVersion,
      deploymentSupported: true // Assume both Cloud and Remote support basic capabilities
    };
  } catch (error) {
    return { compatible: false, upgradeNeeded: false, industrySupported: false, deploymentSupported: false };
  }
}

// Normalize use case categories to match embedded data
export function normalizeUseCaseCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'maintenance': 'predictive-maintenance',
    'forecasting': 'demand-forecasting',
    'quality': 'quality-control',
    'inventory': 'inventory-optimization',
    'customer': 'customer-analytics',
    'finance': 'financial-forecasting',
    'fraud': 'fraud-detection',
    'analytics': 'customer-analytics',
    'optimization': 'supply-chain-optimization',
    'classification': 'automated-classification',
    'existing': 'existing'
  };

  return categoryMap[category.toLowerCase()] || category.toLowerCase();
}
