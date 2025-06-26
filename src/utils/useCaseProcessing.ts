
import { isExistingUseCase } from "./useCaseUtils";
import { getRecommendedModules, normalizeUseCaseCategory, getVersionCompatibility, getCustomerInfo, getCompatibleUseCases } from "./ifs";

export const processDocumentUseCases = async (
  aiRecommendations: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any,
  customerAnalysis?: any
) => {
  // Get customer information from database with enhanced matching
  const customerInfo = await getCustomerInfo(customerName);
  
  // Use database info if available, otherwise fall back to analysis
  const customerVersionInfo = customerInfo || customerAnalysis?.companyDetails;
  const primaryIndustry = customerVersionInfo?.primaryIndustry || customerVersionInfo?.industry || selectedIndustry;
  const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.ifsVersion || 'Cloud';
  const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';

  console.log('Processing document use cases with customer info:', {
    customerName,
    primaryIndustry,
    baseVersion,
    releaseVersion,
    hasCustomerInfo: !!customerInfo
  });

  // Only process use cases that are explicitly from uploaded documents
  const processedUseCases = await Promise.all(
    aiRecommendations
      .filter(useCase => useCase.isFromDocuments === true)
      .map(async (useCase, index) => {
        const normalizedCategory = normalizeUseCaseCategory(useCase?.category || 'general');
        
        // Get modules from database with customer-specific matching
        const recommendedModules = await getRecommendedModules(
          normalizedCategory, 
          supabase, 
          openAIApiKey,
          primaryIndustry,
          releaseVersion,
          baseVersion
        );
        
        // Only return use cases that have supporting ML capabilities in database
        if (recommendedModules.length === 0) {
          console.log(`Filtering out use case "${useCase?.title}" - no ML capabilities found in database`);
          return null;
        }
        
        const primaryModule = recommendedModules[0];
        
        // Check version compatibility using database data
        const compatibility = getVersionCompatibility(
          baseVersion,
          normalizedCategory, 
          primaryIndustry, 
          releaseVersion
        );
        
        // Determine industry relevance
        const industryRelevance = primaryModule.primaryIndustry && 
          primaryModule.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase()) 
          ? 'primary' : 'cross-industry';
        
        return {
          id: `doc-${index}`,
          title: useCase?.title || 'Document Use Case',
          description: useCase?.description || 'Use case found in uploaded documents',
          category: normalizedCategory,
          implementation: useCase?.implementation || (compatibility.compatible ? 'Compatible' : 'Upgrade Required'),
          timeline: useCase?.timeline || (compatibility.compatible ? 'Ready for Implementation' : `Upgrade to ${compatibility.requiredVersion} Required`),
          industries: [selectedIndustry],
          costSavings: useCase?.costSavings || 'Based on documented benefits',
          isFromDocuments: true,
          ragEnhanced: false,
          ragSources: useCase?.ragSources || [],
          sources: useCase?.sources || [],
          industryRelevance: industryRelevance,
          sourceIndustry: primaryModule.primaryIndustry || 'General',
          targetCustomer: customerName,
          implementationJustification: useCase?.implementationJustification || 'Based on factual information found in uploaded documents',
          timelineJustification: useCase?.timelineJustification || 'Timeline based on project details described in documents',
          savingsJustification: useCase?.savingsJustification || 'Cost information based on data found in documents',
          isExisting: isExistingUseCase(useCase?.title || 'Document Use Case', currentUseCases),
          baseVersion: baseVersion,
          releaseVersion: releaseVersion,
          primaryIndustry: primaryIndustry,
          requiredProcess: primaryModule ? `${primaryModule.moduleCode} - ${primaryModule.moduleName}` : 'IC10000 - IFS Cloud Platform',
          coreModules: recommendedModules.map(m => ({
            code: m.moduleCode,
            name: m.moduleName,
            compatible: compatibility.compatible,
            minVersion: m.minVersion,
            description: m.description,
            industryMatch: !primaryIndustry || !m.primaryIndustry || m.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase()),
            versionMatch: !releaseVersion || !m.releaseVersion || m.releaseVersion === releaseVersion,
            deploymentMatch: !baseVersion || !m.baseIfsVersion || m.baseIfsVersion === baseVersion
          }))
        };
      })
  );

  // Filter out null values (use cases without ML capabilities)
  const validUseCases = processedUseCases.filter(useCase => useCase !== null);

  // Sort to put existing use cases first, then by industry relevance
  return validUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    
    // Then sort by industry relevance
    if (a.industryRelevance === 'primary' && b.industryRelevance !== 'primary') return -1;
    if (a.industryRelevance !== 'primary' && b.industryRelevance === 'primary') return 1;
    
    return 0;
  });
};

// Process current use cases and validate they have ML capabilities in database
export const processCurrentUseCases = async (
  currentUseCases: string[],
  selectedIndustry: string,
  customerName: string,
  openAIApiKey?: string,
  supabase?: any,
  customerAnalysis?: any
) => {
  if (!currentUseCases || currentUseCases.length === 0) {
    return [];
  }

  // Get customer information from database with enhanced matching
  const customerInfo = await getCustomerInfo(customerName);
  
  const customerVersionInfo = customerInfo || customerAnalysis?.companyDetails;
  const primaryIndustry = customerVersionInfo?.primaryIndustry || customerVersionInfo?.industry || selectedIndustry;
  const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.ifsVersion || 'Cloud';
  const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';

  console.log('Processing current use cases with customer info:', {
    customerName,
    primaryIndustry,
    baseVersion,
    releaseVersion,
    hasCustomerInfo: !!customerInfo
  });

  const validatedUseCases = await Promise.all(
    currentUseCases.map(async (useCase: string, index: number) => {
      // Try to find ML capabilities for this use case
      const normalizedCategory = normalizeUseCaseCategory(useCase.toLowerCase());
      
      // Get modules from database
      const recommendedModules = await getRecommendedModules(
        normalizedCategory, 
        supabase, 
        openAIApiKey,
        primaryIndustry,
        releaseVersion,
        baseVersion
      );
      
      // Only include use cases that have supporting ML capabilities in database
      if (recommendedModules.length === 0) {
        console.log(`Filtering out current use case "${useCase}" - no ML capabilities found in database`);
        return null;
      }
      
      const primaryModule = recommendedModules[0];
      
      return {
        id: `existing-${index}`,
        title: useCase,
        description: `Active AI/ML solution currently implemented by ${customerName}. This use case is operational and generating business value in the ${primaryIndustry} industry on ${baseVersion} deployment.`,
        category: normalizedCategory,
        implementation: 'Active Implementation',
        timeline: 'Currently Active',
        industries: [selectedIndustry],
        costSavings: 'Actively Generating ROI',
        isFromDocuments: false,
        ragEnhanced: false,
        ragSources: [],
        sources: [],
        industryRelevance: 'primary',
        targetCustomer: customerName,
        implementationJustification: 'Successfully implemented and currently operational',
        timelineJustification: 'Live production system with ongoing benefits',
        savingsJustification: 'Measurable business value being generated from active implementation',
        isExisting: true,
        baseVersion: baseVersion,
        releaseVersion: releaseVersion,
        primaryIndustry: primaryIndustry,
        requiredProcess: primaryModule ? `${primaryModule.moduleCode} (${primaryModule.moduleName})` : 'Core IFS Platform',
        status: 'Active',
        coreModules: recommendedModules.map(m => ({
          code: m.moduleCode,
          name: m.moduleName,
          compatible: true,
          minVersion: m.minVersion,
          description: m.description,
          industryMatch: !primaryIndustry || !m.primaryIndustry || m.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase()),
          versionMatch: !releaseVersion || !m.releaseVersion || m.releaseVersion === releaseVersion,
          deploymentMatch: !baseVersion || !m.baseIfsVersion || m.baseIfsVersion === baseVersion
        }))
      };
    })
  );

  // Filter out null values (use cases without ML capabilities)
  return validatedUseCases.filter(useCase => useCase !== null);
};

// New function to get additional compatible use cases when industry doesn't match exactly
export const getAdditionalCompatibleUseCases = async (
  customerName: string,
  selectedIndustry: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any,
  customerAnalysis?: any
) => {
  // Get customer information from database
  const customerInfo = await getCustomerInfo(customerName);
  
  const customerVersionInfo = customerInfo || customerAnalysis?.companyDetails;
  const primaryIndustry = customerVersionInfo?.primaryIndustry || customerVersionInfo?.industry || selectedIndustry;
  const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.ifsVersion || 'Cloud';
  const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';

  console.log('Getting additional compatible use cases for:', {
    customerName,
    primaryIndustry,
    baseVersion,
    releaseVersion
  });

  // Get all compatible modules for this customer's version
  const compatibleModules = await getCompatibleUseCases(releaseVersion, baseVersion, primaryIndustry);
  
  if (compatibleModules.length === 0) {
    return [];
  }

  // Transform modules into use case format
  const additionalUseCases = compatibleModules
    .filter(module => module.mlCapabilities && module.mlCapabilities.length > 0)
    .flatMap((module, moduleIndex) => 
      module.mlCapabilities.map((capability, capIndex) => {
        const industryRelevance = module.primaryIndustry && 
          module.primaryIndustry.toLowerCase().includes(primaryIndustry.toLowerCase()) 
          ? 'primary' : 'cross-industry';
        
        return {
          id: `compatible-${moduleIndex}-${capIndex}`,
          title: `${capability.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Solution`,
          description: `${capability.replace('-', ' ')} capability available through ${module.moduleName}. Compatible with ${baseVersion} deployment on release ${releaseVersion}.`,
          category: capability,
          implementation: 'Ready for Implementation',
          timeline: 'Can be implemented immediately',
          industries: module.primaryIndustry ? [module.primaryIndustry] : ['General'],
          costSavings: 'Potential ROI based on module capabilities',
          isFromDocuments: false,
          ragEnhanced: false,
          ragSources: [],
          sources: [],
          industryRelevance: industryRelevance,
          sourceIndustry: module.primaryIndustry || 'General',
          targetCustomer: customerName,
          implementationJustification: `Available through ${module.moduleName} module`,
          timelineJustification: 'Module already supports this capability',
          savingsJustification: 'Standard ROI expectations for this capability type',
          isExisting: isExistingUseCase(capability, currentUseCases),
          baseVersion: baseVersion,
          releaseVersion: releaseVersion,
          primaryIndustry: primaryIndustry,
          requiredProcess: `${module.moduleCode} - ${module.moduleName}`,
          coreModules: [{
            code: module.moduleCode,
            name: module.moduleName,
            compatible: true,
            minVersion: module.minVersion,
            description: module.description,
            industryMatch: industryRelevance === 'primary',
            versionMatch: true,
            deploymentMatch: true
          }]
        };
      })
    )
    // Remove duplicates based on capability
    .filter((useCase, index, array) => 
      index === array.findIndex(u => u.category === useCase.category)
    )
    // Sort by industry relevance
    .sort((a, b) => {
      if (a.industryRelevance === 'primary' && b.industryRelevance !== 'primary') return -1;
      if (a.industryRelevance !== 'primary' && b.industryRelevance === 'primary') return 1;
      return 0;
    });

  console.log(`Found ${additionalUseCases.length} additional compatible use cases`);
  return additionalUseCases;
};

export const processRelatedIndustryUseCases = async (
  relatedIndustries: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any
) => {
  // No cross-industry AI generation - return empty array
  // Only show factual use cases from documents and existing customer data
  return [];
};
