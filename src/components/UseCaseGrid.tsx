import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseData } from "@/data/useCaseData";
import { BadgeDollarSign, Briefcase, Sparkles, Users, Cpu, TrendingUp } from "lucide-react";

interface UseCaseGridProps {
  selectedIndustry: string;
  searchTerm: string;
  selectedCategory: string;
  aiRecommendations?: any[];
  rankingOption?: string;
}

export const UseCaseGrid = ({ 
  selectedIndustry, 
  searchTerm, 
  selectedCategory, 
  aiRecommendations = [],
  rankingOption = "relevance"
}: UseCaseGridProps) => {
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);

  // Convert AI recommendations to the format expected by the grid
  const aiUseCases = aiRecommendations.map((useCase, index) => ({
    id: `ai-${index}`,
    title: useCase.title,
    description: useCase.description,
    category: useCase.category,
    roi: useCase.roi.replace('%', ''), // Remove % sign if present
    implementation: useCase.implementation,
    timeline: useCase.timeline,
    industries: [selectedIndustry],
    costSavings: "TBD",
    isAiRecommended: true,
    userCount: Math.floor(Math.random() * 1000) + 100, // Mock data
    tokensConsumed: Math.floor(Math.random() * 50000) + 5000, // Mock data
  }));

  // Filter regular use cases and add mock data
  const filteredRegularUseCases = useCaseData.filter(useCase => {
    const matchesIndustry = !selectedIndustry || selectedIndustry === "all" || useCase.industries.includes(selectedIndustry);
    const matchesSearch = !searchTerm || 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
    
    return matchesIndustry && matchesSearch && matchesCategory;
  }).map(useCase => ({
    ...useCase,
    isAiRecommended: false,
    userCount: Math.floor(Math.random() * 5000) + 500, // Mock data
    tokensConsumed: Math.floor(Math.random() * 100000) + 10000, // Mock data
  }));

  // Combine AI recommendations with regular use cases (AI first)
  let allUseCases = [
    ...aiUseCases,
    ...filteredRegularUseCases.filter(regularUseCase => 
      !aiUseCases.some(aiUseCase => 
        aiUseCase.title.toLowerCase().includes(regularUseCase.title.toLowerCase().split(' ')[0]) ||
        regularUseCase.title.toLowerCase().includes(aiUseCase.title.toLowerCase().split(' ')[0])
      )
    )
  ];

  // Apply ranking
  const rankUseCases = (useCases: any[]) => {
    switch (rankingOption) {
      case "roi":
        return [...useCases].sort((a, b) => parseInt(b.roi) - parseInt(a.roi));
      case "complexity":
        const complexityOrder = { "Low": 1, "Medium": 2, "High": 3 };
        return [...useCases].sort((a, b) => complexityOrder[a.implementation] - complexityOrder[b.implementation]);
      case "industry":
        return [...useCases].sort((a, b) => b.industries.length - a.industries.length);
      case "popularity":
        return [...useCases].sort((a, b) => b.userCount - a.userCount);
      case "relevance":
      default:
        return useCases; // Keep original order (AI recommendations first)
    }
  };

  allUseCases = rankUseCases(allUseCases);

  const getRoiColor = (roi: string) => {
    const roiValue = parseInt(roi);
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
          {allUseCases.length} Available Solution{allUseCases.length !== 1 ? 's' : ''}
        </h2>
        <div className="text-sm text-gray-600">
          Ranked by {rankingOption.replace('-', ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allUseCases.map((useCase) => (
          <Card key={useCase.id} className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 ${
            useCase.isAiRecommended ? 'border-l-purple-500 bg-gradient-to-br from-purple-50 to-white' : 'border-l-blue-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg text-gray-900">{useCase.title}</CardTitle>
                    {useCase.isAiRecommended && (
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {useCase.isAiRecommended && (
                  <Badge className="text-xs bg-purple-100 text-purple-800">
                    AI Recommended
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

                {/* Additional metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>{useCase.userCount} users</span>
                  </div>
                  <div className="flex items-center">
                    <Cpu className="h-3 w-3 mr-1" />
                    <span>{(useCase.tokensConsumed / 1000).toFixed(0)}K tokens</span>
                  </div>
                </div>

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
                  <strong>Best for:</strong> {useCase.industries.slice(0, 2).join(', ')}
                  {useCase.industries.length > 2 && ` +${useCase.industries.length - 2} more`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allUseCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching solutions found</h3>
          <p className="text-gray-600">Try adjusting your search terms or category filters.</p>
        </div>
      )}
    </div>
  );
};
