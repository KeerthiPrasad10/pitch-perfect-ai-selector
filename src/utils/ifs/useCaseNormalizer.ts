
// Use Case Category Normalization Service

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
    'optimization': 'inventory-optimization',
    'supply chain optimization': 'inventory-optimization',
    'supply-chain-optimization': 'inventory-optimization',
    'classification': 'automated-classification',
    'existing': 'existing',
    'general': 'general'
  };

  return categoryMap[category.toLowerCase()] || category.toLowerCase();
}
