
// IFS Version and Module Mapping Utilities
export interface IFSVersionInfo {
  baseVersion: string;
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
}

// Core IFS modules that support AI/ML capabilities
export const IFS_CORE_MODULES: Record<string, IFSCoreModule> = {
  'MANUF': {
    moduleCode: 'MANUF',
    moduleName: 'Manufacturing',
    description: 'Production planning, scheduling, and shop floor management',
    minVersion: '22.1',
    mlCapabilities: ['predictive-maintenance', 'quality-control', 'production-optimization']
  },
  'SCM': {
    moduleCode: 'SCM',
    moduleName: 'Supply Chain Management',
    description: 'Procurement, inventory, and logistics management',
    minVersion: '22.2',
    mlCapabilities: ['demand-forecasting', 'inventory-optimization', 'supplier-analytics']
  },
  'CRM': {
    moduleCode: 'CRM',
    moduleName: 'Customer Relationship Management',
    description: 'Sales, marketing, and customer service',
    minVersion: '23.1',
    mlCapabilities: ['customer-analytics', 'sentiment-analysis', 'lead-scoring']
  },
  'EAM': {
    moduleCode: 'EAM',
    moduleName: 'Enterprise Asset Management',
    description: 'Asset lifecycle and maintenance management',
    minVersion: '22.1',
    mlCapabilities: ['predictive-maintenance', 'anomaly-detection', 'asset-optimization']
  },
  'FINANCE': {
    moduleCode: 'FINANCE',
    moduleName: 'Financial Management',
    description: 'Accounting, budgeting, and financial reporting',
    minVersion: '22.2',
    mlCapabilities: ['fraud-detection', 'financial-forecasting', 'automated-classification']
  },
  'HCM': {
    moduleCode: 'HCM',
    moduleName: 'Human Capital Management',
    description: 'HR processes and workforce management',
    minVersion: '23.1',
    mlCapabilities: ['employee-analytics', 'recruitment-optimization', 'performance-prediction']
  },
  'PROJECT': {
    moduleCode: 'PROJECT',
    moduleName: 'Project Management',
    description: 'Project planning, execution, and portfolio management',
    minVersion: '22.2',
    mlCapabilities: ['project-risk-analysis', 'resource-optimization', 'timeline-prediction']
  }
};

// Map AI/ML use case categories to IFS core modules
export const USE_CASE_TO_MODULE_MAPPING: Record<string, string[]> = {
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

// Get recommended IFS modules for a use case
export function getRecommendedModules(useCaseCategory: string): IFSCoreModule[] {
  const moduleKeys = USE_CASE_TO_MODULE_MAPPING[useCaseCategory] || [];
  return moduleKeys.map(key => IFS_CORE_MODULES[key]).filter(Boolean);
}

// Check if a module supports a specific ML capability
export function isMLCapabilitySupported(moduleCode: string, capability: string): boolean {
  const module = IFS_CORE_MODULES[moduleCode];
  return module ? module.mlCapabilities.includes(capability) : false;
}

// Get version compatibility for ML capabilities
export function getVersionCompatibility(baseVersion: string, capability: string): {
  compatible: boolean;
  requiredVersion?: string;
  upgradeNeeded: boolean;
} {
  const modules = getRecommendedModules(capability);
  if (modules.length === 0) {
    return { compatible: false, upgradeNeeded: false };
  }

  const currentVersion = parseFloat(baseVersion);
  const requiredVersions = modules.map(m => parseFloat(m.minVersion));
  const minRequiredVersion = Math.min(...requiredVersions);

  return {
    compatible: currentVersion >= minRequiredVersion,
    requiredVersion: minRequiredVersion.toString(),
    upgradeNeeded: currentVersion < minRequiredVersion
  };
}

// Normalize use case categories to match our mapping
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
    'classification': 'automated-classification'
  };

  return categoryMap[category.toLowerCase()] || category.toLowerCase();
}
