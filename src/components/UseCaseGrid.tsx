
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseData } from "@/data/useCaseData";
import { BadgeDollarSign, Briefcase, Sparkles, FileText } from "lucide-react";

interface UseCaseGridProps {
  selectedIndustry: string;
  searchTerm: string;
  selectedCategory: string;
  aiRecommendations?: any[];
}

export const UseCaseGrid = ({ selectedIndustry, searchTerm, selectedCategory, aiRecommendations = [] }: UseCaseGridProps) => {
  // Convert AI recommendations to the format expected by the grid
  const aiUseCases = Array.isArray(aiRecommendations) ? aiRecommendations.map((useCase, index) => ({
    id: `ai-${index}`,
    title: useCase?.title || 'AI Recommendation',
    description: useCase?.description || 'No description available',
    category: useCase?.category || 'general',
    roi: typeof useCase?.roi === 'string' ? useCase.roi.replace('%', '') : String(useCase?.roi || '0'),
    implementation: useCase?.implementation || 'Medium',
    timeline: useCase?.timeline || 'TBD',
    industries: [selectedIndustry],
    costSavings: "TBD",
    isAiRecommended: true,
    ragEnhanced: useCase?.ragEnhanced || false,
    ragSources: useCase?.ragSources || []
  })) : [];

  // Filter regular use cases to only show industry-relevant ones
  const filteredRegularUseCases = useCaseData.filter(useCase => {
    // Only show use cases that explicitly include the selected industry
    const matchesIndustry = selectedIndustry && useCase.industries.includes(selectedIndustry);
    const matchesSearch = !searchTerm || 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
    
    return matchesIndustry && matchesSearch && matchesCategory;
  }).map(useCase => ({
    ...useCase,
    isAiRecommended: false,
    ragEnhanced: false,
    ragSources: []
  }));

  // Only show AI recommendations from uploaded documents, no static use cases unless industry matches
  const allUseCases = [
    ...aiUseCases, // These come from uploaded documents via RAG
    ...filteredRegularUseCases // Only industry-specific static use cases
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {allUseCases.length} Recommended AI Solution{allUseCases.length !== 1 ? 's' : ''}
          {aiRecommendations.length > 0 && (
            <span className="ml-2 text-sm text-purple-600 font-normal">
              ({aiRecommendations.length} from uploaded documents)
            </span>
          )}
          {aiRecommendations.some(rec => rec?.ragEnhanced) && (
            <span className="ml-2 text-sm text-blue-600 font-normal">
              (Document-Enhanced)
            </span>
          )}
        </h2>
        <div className="text-sm text-gray-600">
          Industry-specific recommendations only
        </div>
      </div>

      {allUseCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No relevant AI solutions found</h3>
          <p className="text-gray-600">
            {aiRecommendations.length === 0 
              ? "Upload documents containing AI use cases specific to this industry to see recommendations."
              : "Try adjusting your search terms or category filters."
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUseCases.map((useCase) => (
          <Card key={useCase.id} className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 ${
            useCase.ragEnhanced ? 'border-l-blue-500 bg-gradient-to-br from-blue-50 to-white' :
            useCase.isAiRecommended ? 'border-l-purple-500 bg-gradient-to-br from-purple-50 to-white' : 'border-l-gray-300'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg text-gray-900">{useCase.title}</CardTitle>
                    {useCase.ragEnhanced && (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                    {useCase.isAiRecommended && !useCase.ragEnhanced && (
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {useCase.ragEnhanced && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    From Documents
                  </Badge>
                )}
                {useCase.isAiRecommended && !useCase.ragEnhanced && (
                  <Badge className="text-xs bg-purple-100 text-purple-800">
                    From Documents
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

                {useCase.ragSources && useCase.ragSources.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Document Sources:</strong>
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
                  <strong>Industry:</strong> {selectedIndustry}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
