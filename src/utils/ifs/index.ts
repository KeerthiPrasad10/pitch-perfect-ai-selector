
// Export all IFS-related utilities
export * from './types';
export * from './moduleService';
export * from './versionService';
export * from './useCaseNormalizer';
export * from './embeddedDataService';

// Re-export the new customer info function
export { getCustomerInfo } from './moduleService';
