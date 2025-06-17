
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaseData } from "@/data/useCaseData";
import { BadgeDollarSign, Briefcase } from "lucide-react";

interface UseCaseGridProps {
  selectedIndustry: string;
  searchTerm: string;
  selectedCategory: string;
}

export const UseCaseGrid = ({ selectedIndustry, searchTerm, selectedCategory }: UseCaseGridProps) => {
  const [selectedUseCase, setSelectedUseCase] = useState<any>(null);

  const filteredUseCases = useCaseData.filter(useCase => {
    // If an industry is selected, show use cases that include this industry
    const matchesIndustry = !selectedIndustry || selectedIndustry === "all" || useCase.industries.includes(selectedIndustry);
    const matchesSearch = !searchTerm || 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
    
    return matchesIndustry && matchesSearch && matchesCategory;
  });

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
          {filteredUseCases.length} Recommended AI Solution{filteredUseCases.length !== 1 ? 's' : ''}
        </h2>
        <div className="text-sm text-gray-600">
          Ranked by relevance and ROI potential
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUseCases.map((useCase) => (
          <Card key={useCase.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900 mb-2">{useCase.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
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

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <BadgeDollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        ${useCase.costSavings}
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

      {filteredUseCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching solutions found</h3>
          <p className="text-gray-600">Try adjusting your search terms or category filters.</p>
        </div>
      )}
    </div>
  );
};
