
import { Briefcase, FileText, Database } from "lucide-react";
import { UseCaseCard } from "./UseCaseCard";
import { processDocumentUseCases, processCurrentUseCases } from "@/utils/useCaseProcessing";
import { useEffect, useState } from "react";
import { normalizeUseCaseCategory, getRecommendedModules, getCustomerInfo } from "@/utils/ifs";
import { supabase } from "@/integrations/supabase/client";

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
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  useEffect(() => {
    const processUseCases = async () => {
      setIsLoading(true);
      
      // Get customer information from database first
      const dbCustomerInfo = customerName ? await getCustomerInfo(customerName) : null;
      setCustomerInfo(dbCustomerInfo);
      
      // Get current use cases from customer analysis or database
      const currentUseCases = dbCustomerInfo?.currentUseCases || customerAnalysis?.currentUseCases || [];
      
      // Get OpenAI API key from customer analysis
      const openAIApiKey = customerAnalysis?.openAIApiKey;

      // Only process factual use cases from documents (no AI generation)
      const documentUseCases = await processDocumentUseCases(
        aiRecommendations, 
        selectedIndustry, 
        customerName || '', 
        currentUseCases,
        openAIApiKey,
        supabase,
        customerAnalysis
      );

      // Validate existing customer use cases against database ML capabilities
      const existingUseCases = await processCurrentUseCases(
        currentUseCases,
        selectedIndustry,
        customerName || '',
        openAIApiKey,
        supabase,
        customerAnalysis
      );

      // Filter based on search and category
      const filteredUseCases = [...existingUseCases, ...documentUseCases].filter(useCase => {
        const matchesSearch = !searchTerm || 
          useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          useCase.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === "all" || useCase.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      // Sort to ensure existing use cases are always first
      const sortedUseCases = filteredUseCases.sort((a, b) => {
        if (a.isExisting && !b.isExisting) return -1;
        if (!a.isExisting && b.isExisting) return 1;
        return 0;
      });

      setAllUseCases(sortedUseCases);
      setIsLoading(false);
    };

    processUseCases();
  }, [selectedIndustry, searchTerm, selectedCategory, aiRecommendations, customerName, relatedIndustries, customerAnalysis]);

  const documentUseCases = allUseCases.filter(uc => uc.isFromDocuments);
  const existingUseCases = allUseCases.filter(uc => uc.isExisting);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Use database customer info if available, otherwise fall back to analysis
  const displayCustomerInfo = customerInfo || customerAnalysis?.companyDetails;
  const primaryIndustry = displayCustomerInfo?.primaryIndustry || displayCustomerInfo?.industry || selectedIndustry;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {allUseCases.length} Validated AI Solution{allUseCases.length !== 1 ? 's' : ''} for {customerName}
          {(existingUseCases.length > 0 || documentUseCases.length > 0) && (
            <span className="ml-2 text-sm text-purple-600 font-normal">
              ({existingUseCases.length} active implementations, {documentUseCases.length} from documents)
            </span>
          )}
        </h2>
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          {customerInfo ? (
            <>
              <Database className="h-4 w-4" />
              <span>Database Match: {primaryIndustry} • {displayCustomerInfo?.releaseVersion || 'N/A'} • {displayCustomerInfo?.baseIfsVersion || 'N/A'}</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              <span>Analysis Based: {primaryIndustry} • {displayCustomerInfo?.releaseVersion || 'N/A'} • {displayCustomerInfo?.baseIfsVersion || 'N/A'}</span>
            </>
          )}
        </div>
      </div>

      {allUseCases.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No validated AI solutions found</h3>
          <p className="text-gray-600">
            No ML use cases found with confirmed capabilities in the database that match the combination of {primaryIndustry} industry, 
            {displayCustomerInfo?.releaseVersion || 'unknown'} release version, and 
            {displayCustomerInfo?.baseIfsVersion || 'unknown'} deployment type.
          </p>
          {!customerInfo && (
            <p className="text-sm text-blue-600 mt-2">
              Customer not found in database. Results based on AI analysis only.
            </p>
          )}
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
