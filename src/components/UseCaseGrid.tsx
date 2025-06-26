
import { Briefcase, FileText } from "lucide-react";
import { UseCaseCard } from "./UseCaseCard";
import { processDocumentUseCases, processRelatedIndustryUseCases } from "@/utils/useCaseProcessing";
import { useEffect, useState } from "react";

interface UseCaseGridProps {
  selectedIndustry: string;
  searchTerm: string;
  selectedCategory: string;
  aiRecommendations?: any[];
  customerName?: string;
  relatedIndustries?: any[];
  customerAnalysis?: any;
}

export const UseCaseGrid = ({ 
  selectedIndustry, 
  searchTerm, 
  selectedCategory, 
  aiRecommendations = [], 
  customerName,
  relatedIndustries = [],
  customerAnalysis
}: UseCaseGridProps) => {
  const [allUseCases, setAllUseCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processUseCases = async () => {
      setIsLoading(true);
      
      // Get current use cases from customer analysis
      const currentUseCases = customerAnalysis?.currentUseCases || [];

      // Get access to OpenAI API and Supabase for RAG queries
      const openAIApiKey = process.env.OPENAI_API_KEY;
      const supabase = null; // Will be passed from parent component

      // Process different types of use cases (already sorted with existing cases first)
      const documentUseCases = await processDocumentUseCases(
        aiRecommendations, 
        selectedIndustry, 
        customerName || '', 
        currentUseCases,
        openAIApiKey,
        supabase
      );

      const relatedIndustryUseCases = (await processRelatedIndustryUseCases(
        relatedIndustries, 
        selectedIndustry, 
        customerName || '', 
        currentUseCases,
        openAIApiKey,
        supabase
      )).filter(useCase => {
        const matchesSearch = !searchTerm || 
          useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      // Combine all use cases and sort globally to ensure existing cases are always at the top
      const combinedUseCases = [
        ...documentUseCases,
        ...relatedIndustryUseCases
      ].sort((a, b) => {
        // Primary sort: existing use cases first
        if (a.isExisting && !b.isExisting) return -1;
        if (!a.isExisting && b.isExisting) return 1;
        
        // Secondary sort: maintain source priority (document > related)
        if (a.isFromDocuments && !b.isFromDocuments) return -1;
        if (!a.isFromDocuments && b.isFromDocuments) return 1;
        
        if (a.industryRelevance && b.industryRelevance && !a.isFromDocuments && !b.isFromDocuments) {
          const relevanceOrder = { 'primary': 0, 'secondary': 1, 'tertiary': 2 };
          return (relevanceOrder[a.industryRelevance as keyof typeof relevanceOrder] || 3) - 
                 (relevanceOrder[b.industryRelevance as keyof typeof relevanceOrder] || 3);
        }
        
        return 0;
      });

      setAllUseCases(combinedUseCases);
      setIsLoading(false);
    };

    processUseCases();
  }, [selectedIndustry, searchTerm, selectedCategory, aiRecommendations, customerName, relatedIndustries, customerAnalysis]);

  const documentUseCases = allUseCases.filter(uc => uc.isFromDocuments);
  const relatedIndustryUseCases = allUseCases.filter(uc => uc.industryRelevance && uc.industryRelevance !== 'primary' && !uc.isFromDocuments);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

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
          <UseCaseCard 
            key={useCase.id} 
            useCase={useCase} 
            selectedIndustry={selectedIndustry}
          />
        ))}
      </div>
    </div>
  );
};
