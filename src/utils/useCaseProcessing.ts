
import { isExistingUseCase } from "./useCaseUtils";

export const processDocumentUseCases = async (
  aiRecommendations: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[],
  openAIApiKey?: string,
  supabase?: any
) => {
  // Only process use cases that are explicitly from uploaded documents
  // No AI generation - only factual data from documents
  const processedUseCases = aiRecommendations
    .filter(useCase => useCase.isFromDocuments === true) // Only document-based factual use cases
    .map((useCase, index) => ({
      id: `doc-${index}`,
      title: useCase?.title || 'Document Use Case',
      description: useCase?.description || 'Use case found in uploaded documents',
      category: useCase?.category || 'general',
      implementation: useCase?.implementation || 'TBD',
      timeline: useCase?.timeline || 'TBD',
      industries: [selectedIndustry],
      costSavings: useCase?.costSavings || 'TBD',
      isFromDocuments: true,
      ragEnhanced: false,
      ragSources: useCase?.ragSources || [],
      sources: useCase?.sources || [],
      industryRelevance: 'primary',
      targetCustomer: customerName,
      implementationJustification: 'Based on factual information found in uploaded documents',
      timelineJustification: 'Timeline based on project details described in documents',
      savingsJustification: 'Cost information based on data found in documents',
      isExisting: isExistingUseCase(useCase?.title || 'Document Use Case', currentUseCases),
      baseVersion: useCase?.baseVersion || 'TBD',
      releaseVersion: useCase?.releaseVersion || 'TBD',
      requiredProcess: useCase?.requiredProcess || 'TBD'
    }));

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
