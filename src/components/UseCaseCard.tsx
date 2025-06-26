
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Target, TrendingUp, Briefcase, Settings, Clock } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";
import { getRelevanceBadgeColor } from "@/utils/useCaseUtils";

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

  const getVersionBadgeColor = (version: string) => {
    if (version === 'TBD' || !version) return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* IFS Version Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <div className="text-xs">
                <span className="font-medium text-gray-700">Base Version:</span>
                <Badge className={`ml-1 text-xs ${getVersionBadgeColor(useCase.baseVersion)}`}>
                  {useCase.baseVersion || 'TBD'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div className="text-xs">
                <span className="font-medium text-gray-700">Release:</span>
                <Badge className={`ml-1 text-xs ${getVersionBadgeColor(useCase.releaseVersion)}`}>
                  {useCase.releaseVersion || 'TBD'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Required Process/Core Module */}
          {useCase.requiredProcess && useCase.requiredProcess !== 'TBD' && (
            <div className="border-t pt-3">
              <div className="text-xs text-gray-600 mb-1">
                <strong>Required Core Module:</strong>
              </div>
              <Badge className="text-xs bg-orange-100 text-orange-800">
                {useCase.requiredProcess}
              </Badge>
            </div>
          )}

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
