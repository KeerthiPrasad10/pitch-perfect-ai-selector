
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, FileText, CheckCircle, Target, TrendingUp, Briefcase } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";
import { getRoiColor, getImplementationColor, getRelevanceBadgeColor } from "@/utils/useCaseUtils";

interface UseCaseCardProps {
  useCase: any;
  selectedIndustry: string;
}

export const UseCaseCard = ({ useCase, selectedIndustry }: UseCaseCardProps) => {
  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'primary': return <Target className="h-3 w-3" />;
      case 'secondary': return <TrendingUp className="h-3 w-3" />;
      case 'tertiary': return <Briefcase className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 cursor-pointer border-l-4 ${
      useCase.isExisting
        ? 'border-l-green-500 bg-gradient-to-br from-green-50 to-white shadow-green-100'
        : useCase.isFromDocuments 
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
              {useCase.isExisting && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
            <CardDescription className="text-gray-600 text-sm leading-relaxed">
              {useCase.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {useCase.isExisting && (
            <Badge className="text-xs bg-green-100 text-green-800 flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Existing Use Case</span>
            </Badge>
          )}
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
          <Badge className={`text-xs ${getRoiColor(useCase.roi)} flex items-center`}>
            ROI: {useCase.roi}%
            <InfoTooltip content={useCase.roiJustification} />
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Implementation:</span>
            <div className="flex items-center">
              <Badge className={`text-xs ${getImplementationColor(useCase.implementation)}`}>
                {useCase.implementation} Complexity
              </Badge>
              <InfoTooltip content={useCase.implementationJustification} />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Timeline:</span>
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{useCase.timeline}</span>
              <InfoTooltip content={useCase.timelineJustification} />
            </div>
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
                <InfoTooltip content={useCase.savingsJustification} />
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                {useCase.isExisting ? 'Expand Usage' : 'Add to Pitch'}
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
  );
};
