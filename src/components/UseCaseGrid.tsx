import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseData } from "@/data/useCaseData";
import { BadgeDollarSign, Briefcase, Sparkles, FileText, UserCheck, Users, Target, TrendingUp } from "lucide-react";

interface UseCaseGridProps {
  selectedIndustry: string;
  searchTerm: string;
  selectedCategory: string;
  aiRecommendations?: any[];
  customerName?: string;
  relatedIndustries?: any[];
}

export const UseCaseGrid = ({ 
  selectedIndustry, 
  searchTerm, 
  selectedCategory, 
  aiRecommendations = [], 
  customerName,
  relatedIndustries = []
}: UseCaseGridProps) => {
  // Convert AI recommendations to the format expected by the grid
  const documentUseCases = Array.isArray(aiRecommendations) ? aiRecommendations.map((useCase, index) => ({
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
    industryRelevance: 'primary'
  })) : [];

  // Generate use cases from related industries
  const relatedIndustryUseCases = relatedIndustries.flatMap((industryInfo, industryIndex) => 
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
      sourceIndustry: industryInfo.industry
    }))
  );

  // Only show document-based use cases and industry-specific static use cases
  const filteredStaticUseCases = useCaseData.filter(useCase => {
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
    industryRelevance: 'primary'
  }));

  // Prioritize: document-based recommendations, then related industry use cases, then static use cases
  const allUseCases = [
    ...documentUseCases, // From uploaded documents (highest priority)
    ...relatedIndustryUseCases.filter(useCase => {
      const matchesSearch = !searchTerm || 
        useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }), // From related industries
    ...filteredStaticUseCases // Static industry-specific use cases
  ];

  const getRoiColor = (roi: string) => {
    const roiValue = parseInt(roi) || 0;
    if (roiValue >= 200) return "bg-green-100 text-green-800";
    if (roiValue >= 100) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getImplementationColor = (complexity: string) => {
    switch (complexity) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRelevanceBadgeColor = (relevance: string) => {
    switch (relevance) {
      case 'primary': return 'bg-purple-100 text-purple-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'tertiary': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'primary': return <Target className="h-3 w-3" />;
      case 'secondary': return <TrendingUp className="h-3 w-3" />;
      case 'tertiary': return <Briefcase className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {allUseCases.length} AI Solution{allUseCases.length !== 1 ? 's' : ''} for {customerName}
          {documentUseCases.length > 0 && (
            <span className="ml-2 text-sm text-purple-600 font-normal">
              ({documentUseCases.length} from documents, {relatedIndustryUseCases.length} cross-industry)
            </span>
          )}
        </h2>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Multi-industry AI opportunities</span>
        </div>
      </div>

      {allUseCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No relevant AI solutions found</h3>
          <p className="text-gray-600">
            Upload documents containing AI use cases specific to the {selectedIndustry} industry to see personalized recommendations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUseCases.map((useCase) => (
          <Card key={useCase.id} className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 ${
            useCase.isFromDocuments 
              ? 'border-l-purple-500 bg-gradient-to-br from-purple-50 to-white' 
              : useCase.industryRelevance === 'secondary' || useCase.industryRelevance === 'tertiary'
                ? 'border-l-blue-400 bg-gradient-to-br from-blue-50 to-white'
                : 'border-l-gray-300 bg-white'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg text-gray-900">{useCase.title}</CardTitle>
                    {useCase.isFromDocuments && (
                      <FileText className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {useCase.isFromDocuments && (
                  <Badge className="text-xs bg-purple-100 text-purple-800">
                    From Documents
                  </Badge>
                )}
                {useCase.industryRelevance && useCase.industryRelevance !== 'primary' && (
                  <Badge className={`text-xs ${getRelevanceBadgeColor(useCase.industryRelevance)} flex items-center space-x-1`}>
                    {getRelevanceIcon(useCase.industryRelevance)}
                    <span>
                      {useCase.sourceIndustry ? `From ${useCase.sourceIndustry}` : 'Cross-Industry'}
                    </span>
                  </Badge>
                )}
                {useCase.ragEnhanced && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    RAG Enhanced
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {useCase.category.replace('-', ' ')}
                </Badge>
                <Badge className={`text-xs ${getRoiColor(useCase.roi)}`}>
                  ROI: {useCase.roi}%
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Implementation:</span>
                  <Badge className={`text-xs ${getImplementationColor(useCase.implementation)}`}>
                    {useCase.implementation} Complexity
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Timeline:</span>
                  <span className="font-medium text-gray-900">{useCase.timeline}</span>
                </div>

                {useCase.sources && useCase.sources.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Document Sources:</strong>
                    </div>
                    <div className="space-y-1">
                      {useCase.sources.slice(0, 2).map((source: any, index: number) => (
                        <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <div className="font-medium">{source?.file_name || 'Unknown file'}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {Math.round((source?.similarity || 0) * 100)}% match
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {useCase.ragSources && useCase.ragSources.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>RAG Sources:</strong>
                    </div>
                    <div className="space-y-1">
                      {useCase.ragSources.slice(0, 2).map((source: any, index: number) => (
                        <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <div className="font-medium">{source?.file_name || 'Unknown file'}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {Math.round((source?.similarity || 0) * 100)}% match
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <BadgeDollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {useCase.costSavings || "TBD"}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Add to Pitch
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <strong>Target Industry:</strong> {useCase.sourceIndustry || selectedIndustry}
                  {useCase.sourceIndustry && useCase.sourceIndustry !== selectedIndustry && (
                    <span className="ml-1 text-blue-600">(applicable to {selectedIndustry})</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function getRoiColor(roi: string) {
  const roiValue = parseInt(roi) || 0;
  if (roiValue >= 200) return "bg-green-100 text-green-800";
  if (roiValue >= 100) return "bg-yellow-100 text-yellow-800";
  return "bg-blue-100 text-blue-800";
}

function getImplementationColor(complexity: string) {
  switch (complexity) {
    case "Low": return "bg-green-100 text-green-800";
    case "Medium": return "bg-yellow-100 text-yellow-800";
    case "High": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
