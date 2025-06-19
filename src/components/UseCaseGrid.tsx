
import { Briefcase, FileText } from "lucide-react";
import { UseCaseCard } from "./UseCaseCard";
import { processDocumentUseCases, processRelatedIndustryUseCases, processStaticUseCases } from "@/utils/useCaseProcessing";

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
  // Get current use cases from customer analysis
  const currentUseCases = customerAnalysis?.currentUseCases || [];

  // Process different types of use cases
  const documentUseCases = processDocumentUseCases(
    aiRecommendations, 
    selectedIndustry, 
    customerName || '', 
    currentUseCases
  );

  const relatedIndustryUseCases = processRelatedIndustryUseCases(
    relatedIndustries, 
    selectedIndustry, 
    customerName || '', 
    currentUseCases
  ).filter(useCase => {
    const matchesSearch = !searchTerm || 
      useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredStaticUseCases = processStaticUseCases(
    selectedIndustry,
    searchTerm,
    selectedCategory,
    customerName || '',
    currentUseCases
  );

  // Prioritize: document-based recommendations, then related industry use cases, then static use cases
  const allUseCases = [
    ...documentUseCases, // From uploaded documents (highest priority)
    ...relatedIndustryUseCases, // From related industries
    ...filteredStaticUseCases // Static industry-specific use cases
  ];

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
