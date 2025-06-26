
// Export all IFS-related utilities
export * from './types';
export * from './moduleService';
export * from './versionService';
export * from './useCaseNormalizer';
export * from './embeddedDataService';

// Re-export the enhanced customer info and compatibility functions
export { getCustomerInfo, getCompatibleUseCases } from './moduleService';
