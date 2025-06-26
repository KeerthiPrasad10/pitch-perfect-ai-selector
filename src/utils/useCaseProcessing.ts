
import { isExistingUseCase } from "./useCaseUtils";
import { getRecommendedModules, normalizeUseCaseCategory, getVersionCompatibility } from "./ifs";

export const processDocumentUseCases = async (
  aiRecommendations: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any,
  customerAnalysis?: any
) => {
  // Only process use cases that are explicitly from uploaded documents
  // No AI generation - only factual data from documents
  const processedUseCases = await Promise.all(
    aiRecommendations
      .filter(useCase => useCase.isFromDocuments === true) // Only document-based factual use cases
      .map(async (useCase, index) => {
        const normalizedCategory = normalizeUseCaseCategory(useCase?.category || 'general');
        
        // Get customer's IFS details for matching
        const customerVersionInfo = customerAnalysis?.companyDetails;
        const primaryIndustry = customerVersionInfo?.primaryIndustry || customerVersionInfo?.industry || selectedIndustry;
        const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.ifsVersion || 'Cloud'; // Cloud or Remote
        const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';
        
        // Get modules from embedded Excel data with customer-specific matching (including deployment type)
        const recommendedModules = await getRecommendedModules(
          normalizedCategory, 
          supabase, 
          openAIApiKey,
          primaryIndustry,
          releaseVersion,
          baseVersion // Cloud or Remote
        );
        
        // Only return use cases that have supporting ML capabilities in embedded data
        if (recommendedModules.length === 0) {
          console.log(`Filtering out use case "${useCase?.title}" - no ML capabilities found in embedded data`);
          return null;
        }
        
        const primaryModule = recommendedModules[0];
        
        // Check version compatibility using embedded data with customer context
        const compatibility = getVersionCompatibility(
          baseVersion, // Cloud or Remote
          normalizedCategory, 
          primaryIndustry, 
          releaseVersion
        );
        
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
          industryRelevance: 'primary',
          targetCustomer: customerName,
          implementationJustification: useCase?.implementationJustification || 'Based on factual information found in uploaded documents',
          timelineJustification: useCase?.timelineJustification || 'Timeline based on project details described in documents',
          savingsJustification: useCase?.savingsJustification || 'Cost information based on data found in documents',
          isExisting: isExistingUseCase(useCase?.title || 'Document Use Case', currentUseCases),
          baseVersion: baseVersion, // Cloud or Remote
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
            deploymentMatch: !baseVersion || !m.baseIfsVersion || m.baseIfsVersion === baseVersion // Cloud or Remote
          }))
        };
      })
  );

  // Filter out null values (use cases without ML capabilities)
  const validUseCases = processedUseCases.filter(useCase => useCase !== null);

  // Sort to put existing use cases first
  return validUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};

// Process current use cases and validate they have ML capabilities in embedded data
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

  const customerVersionInfo = customerAnalysis?.companyDetails;
  const primaryIndustry = customerVersionInfo?.primaryIndustry || customerVersionInfo?.industry || selectedIndustry;
  const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.ifsVersion || 'Cloud';
  const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';

  const validatedUseCases = await Promise.all(
    currentUseCases.map(async (useCase: string, index: number) => {
      // Try to find ML capabilities for this use case
      const normalizedCategory = normalizeUseCaseCategory(useCase.toLowerCase());
      
      // Get modules from embedded Excel data
      const recommendedModules = await getRecommendedModules(
        normalizedCategory, 
        supabase, 
        openAIApiKey,
        primaryIndustry,
        releaseVersion,
        baseVersion
      );
      
      // Only include use cases that have supporting ML capabilities in embedded data
      if (recommendedModules.length === 0) {
        console.log(`Filtering out current use case "${useCase}" - no ML capabilities found in embedded data`);
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
          compatible: true, // Since it's already active
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
