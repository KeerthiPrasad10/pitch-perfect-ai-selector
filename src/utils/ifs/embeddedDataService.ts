
// Embedded Excel Data Service for IFS Mapping
import type { IFSCoreModule } from './types';

// Cache for embedded data to avoid repeated API calls
let cachedEmbeddedData: any = null;
let cachedModules: Record<string, IFSCoreModule> = {};

// Get IFS module and version data from embedded Excel sheet with industry matching
export async function getEmbeddedMappingData(
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
export function parseEmbeddedModuleData(
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
      modules['IC10100'] = {
        moduleCode: 'IC10100',
        moduleName: 'IFS Manufacturing Platform',
        description: 'Production planning, scheduling, and shop floor management',
        minVersion: extractVersionFromText(text) || '22.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['predictive-maintenance', 'quality-control', 'production-optimization']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('supply chain') || text.includes('scm')) {
      modules['IC10200'] = {
        moduleCode: 'IC10200',
        moduleName: 'IFS Supply Chain Management Platform',
        description: 'Procurement, inventory, and logistics management',
        minVersion: extractVersionFromText(text) || '22.2',
        mlCapabilities: extractCapabilitiesFromText(text, ['demand-forecasting', 'inventory-optimization', 'supplier-analytics']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('customer relationship') || text.includes('crm')) {
      modules['IC10300'] = {
        moduleCode: 'IC10300',
        moduleName: 'IFS Customer Relationship Management Platform',
        description: 'Sales, marketing, and customer service',
        minVersion: extractVersionFromText(text) || '23.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['customer-analytics', 'sentiment-analysis', 'lead-scoring']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('enterprise asset') || text.includes('eam')) {
      modules['IC10400'] = {
        moduleCode: 'IC10400',
        moduleName: 'IFS Enterprise Asset Management Platform',
        description: 'Asset lifecycle and maintenance management',
        minVersion: extractVersionFromText(text) || '22.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['predictive-maintenance', 'anomaly-detection', 'asset-optimization']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('financial') || text.includes('finance')) {
      modules['IC10500'] = {
        moduleCode: 'IC10500',
        moduleName: 'IFS Financial Management Platform',
        description: 'Accounting, budgeting, and financial reporting',
        minVersion: extractVersionFromText(text) || '22.2',
        mlCapabilities: extractCapabilitiesFromText(text, ['fraud-detection', 'financial-forecasting', 'automated-classification']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('human capital') || text.includes('hcm') || text.includes('hr')) {
      modules['IC10600'] = {
        moduleCode: 'IC10600',
        moduleName: 'IFS Human Capital Management Platform',
        description: 'HR processes and workforce management',
        minVersion: extractVersionFromText(text) || '23.1',
        mlCapabilities: extractCapabilitiesFromText(text, ['employee-analytics', 'recruitment-optimization', 'performance-prediction']),
        primaryIndustry: extractIndustryFromText(text) || primaryIndustry,
        releaseVersion: releaseVersion,
        baseIfsVersion: baseIfsVersion // Cloud or Remote
      };
    }
    
    if (text.includes('project management') || text.includes('project')) {
      modules['IC10700'] = {
        moduleCode: 'IC10700',
        moduleName: 'IFS Project Management Platform',
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

// Export cache for use in other modules
export function getCachedModules(): Record<string, IFSCoreModule> {
  return cachedModules;
}

export function setCachedModules(modules: Record<string, IFSCoreModule>): void {
  cachedModules = modules;
}

export function getCachedEmbeddedData(): any {
  return cachedEmbeddedData;
}

export function setCachedEmbeddedData(data: any): void {
  cachedEmbeddedData = data;
}
