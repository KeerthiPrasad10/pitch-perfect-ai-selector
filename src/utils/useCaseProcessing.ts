
import { isExistingUseCase } from "./useCaseUtils";
import { getRecommendedModules, normalizeUseCaseCategory, getVersionCompatibility } from "./ifsVersionMapping";

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
        
        // Get modules from embedded Excel data
        const recommendedModules = await getRecommendedModules(normalizedCategory, supabase, openAIApiKey);
        const primaryModule = recommendedModules[0];
        
        // Get customer's IFS version info from embedded data or customer analysis
        const customerVersionInfo = customerAnalysis?.companyDetails;
        const baseVersion = customerVersionInfo?.baseIfsVersion || customerVersionInfo?.releaseVersion || '22.1';
        const releaseVersion = customerVersionInfo?.releaseVersion || customerVersionInfo?.softwareReleaseVersion || '22.1';
        
        // Check version compatibility using embedded data
        const compatibility = getVersionCompatibility(baseVersion, normalizedCategory);
        
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
          baseVersion: baseVersion,
          releaseVersion: releaseVersion,
          requiredProcess: primaryModule ? `${primaryModule.moduleCode} (${primaryModule.moduleName})` : 'Core IFS Platform',
          coreModules: recommendedModules.map(m => ({
            code: m.moduleCode,
            name: m.moduleName,
            compatible: compatibility.compatible,
            minVersion: m.minVersion,
            description: m.description
          }))
        };
      })
  );

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
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
