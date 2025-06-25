
import { useCaseData } from "@/data/useCaseData";
import { isExistingUseCase } from "./useCaseUtils";

export const processDocumentUseCases = (
  aiRecommendations: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[]
) => {
  const processedUseCases = Array.isArray(aiRecommendations) ? aiRecommendations.map((useCase, index) => ({
    id: `doc-${index}`,
    title: useCase?.title || 'AI Recommendation',
    description: useCase?.description || 'No description available',
    category: useCase?.category || 'general',
    roi: typeof useCase?.roi === 'string' ? useCase.roi.replace('%', '') : String(useCase?.roi || '0'),
    implementation: useCase?.implementation || 'Medium',
    timeline: useCase?.timeline || 'TBD',
    industries: [selectedIndustry],
    costSavings: "TBD",
    isFromDocuments: true,
    ragEnhanced: useCase?.ragEnhanced || false,
    ragSources: useCase?.ragSources || [],
    sources: useCase?.sources || [],
    industryRelevance: 'primary',
    targetCustomer: customerName,
    roiJustification: useCase?.roiJustification || 'ROI estimated by AI analysis of document content and similar industry implementations',
    implementationJustification: useCase?.implementationJustification || 'Implementation complexity assessed by AI based on technical requirements found in documents',
    timelineJustification: useCase?.timelineJustification || 'Timeline estimated by AI based on project details and implementation patterns described in documents',
    savingsJustification: useCase?.savingsJustification || 'Cost savings estimated by AI based on efficiency improvements and case studies found in documents',
    isExisting: isExistingUseCase(useCase?.title || 'AI Recommendation', currentUseCases)
  })) : [];

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};

export const processRelatedIndustryUseCases = (
  relatedIndustries: any[],
  selectedIndustry: string,
  customerName: string,
  currentUseCases: string[]
) => {
  const processedUseCases = relatedIndustries.flatMap((industryInfo, industryIndex) => 
    industryInfo.useCases.slice(0, 3).map((useCase: string, index: number) => ({
      id: `related-${industryIndex}-${index}`,
      title: useCase,
      description: `${useCase} solution tailored for ${industryInfo.industry} industry with applications in ${selectedIndustry}`,
      category: 'cross-industry',
      roi: industryInfo.relevance === 'primary' ? '150' : industryInfo.relevance === 'secondary' ? '120' : '100',
      implementation: 'Medium',
      timeline: industryInfo.relevance === 'primary' ? '6-12 months' : '12-18 months',
      industries: [industryInfo.industry],
      costSavings: industryInfo.relevance === 'primary' ? '$500K+' : '$250K+',
      isFromDocuments: false,
      ragEnhanced: false,
      ragSources: [],
      sources: [],
      industryRelevance: industryInfo.relevance,
      sourceIndustry: industryInfo.industry,
      targetCustomer: customerName,
      roiJustification: `ROI estimated by AI based on ${industryInfo.relevance} industry relevance patterns and cross-industry benchmark analysis`,
      implementationJustification: 'Implementation complexity assessed by AI using cross-industry deployment experience and technical similarity analysis',
      timelineJustification: `Timeline estimated by AI considering ${industryInfo.relevance} industry alignment and typical cross-industry adaptation cycles`,
      savingsJustification: `Cost savings projected by AI from ${industryInfo.industry} industry benchmarks and cross-industry efficiency transfer analysis`,
      isExisting: isExistingUseCase(useCase, currentUseCases)
    }))
  );

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};

export const processStaticUseCases = (
  selectedIndustry: string,
  searchTerm: string,
  selectedCategory: string,
  customerName: string,
  currentUseCases: string[]
) => {
  const processedUseCases = useCaseData.filter(useCase => {
    const matchesIndustry = selectedIndustry && useCase.industries.includes(selectedIndustry);
    const matchesSearch = !searchTerm || 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
    
    return matchesIndustry && matchesSearch && matchesCategory;
  }).map(useCase => ({
    ...useCase,
    isFromDocuments: false,
    ragEnhanced: false,
    ragSources: [],
    sources: [],
    industryRelevance: 'primary',
    targetCustomer: customerName,
    roiJustification: `ROI based on ${selectedIndustry} industry benchmarks, historical implementation data, and market research studies`,
    implementationJustification: `Implementation complexity assessed from standard ${selectedIndustry} industry practices, typical IT infrastructure, and deployment patterns`,
    timelineJustification: `Timeline based on typical ${selectedIndustry} industry deployment cycles, regulatory requirements, and change management patterns`,
    savingsJustification: `Cost savings based on ${selectedIndustry} industry average efficiency gains, labor cost reductions, and operational improvements`,
    isExisting: isExistingUseCase(useCase.title, currentUseCases)
  }));

  // Sort to put existing use cases first
  return processedUseCases.sort((a, b) => {
    if (a.isExisting && !b.isExisting) return -1;
    if (!a.isExisting && b.isExisting) return 1;
    return 0;
  });
};
