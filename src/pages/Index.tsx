
import { useState } from "react";
import { IndustrySelector } from "@/components/IndustrySelector";
import { SearchFilter } from "@/components/SearchFilter";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { CustomerInput } from "@/components/CustomerInput";
import { useToast } from "@/hooks/use-toast";
import { useMLAnalysis } from "@/hooks/useMLAnalysis";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Building2, Loader2, CheckCircle, Zap, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [rankingOption, setRankingOption] = useState<string>("relevance");
  const { toast } = useToast();
  const { analyzeMLUseCases, loading: mlLoading, result: mlResult } = useMLAnalysis();

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleIndustrySelected = (industry: string, customerName: string, aiRecommendations?: any[]) => {
    setSelectedIndustry(industry);
    setSelectedCustomer(customerName);
    if (aiRecommendations && aiRecommendations.length > 0) {
      console.log('AI recommendations received:', aiRecommendations);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedIndustry || selectedIndustry === "all") {
      toast({
        title: "Industry Required",
        description: "Please select an industry to get personalized ML recommendations.",
        variant: "destructive",
      });
      return;
    }

    await analyzeMLUseCases(selectedIndustry, selectedCustomer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center justify-center space-x-3">
            <Zap className="h-7 w-7 text-yellow-500" />
            <span>AI-Powered Use Case Explorer</span>
            <TrendingUp className="h-7 w-7 text-green-500" />
          </h1>
          <p className="mt-2 text-lg text-gray-600 text-center">
            Discover innovative AI and Machine Learning use cases tailored to your industry.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Input */}
            <CustomerInput onIndustrySelected={handleIndustrySelected} />

            {/* Industry Selector */}
            <IndustrySelector 
              selectedIndustry={selectedIndustry}
              onIndustryChange={handleIndustryChange} 
            />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                AI-Powered Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get personalized ML use cases based on your uploaded documents and industry context.
              </p>
              <Button 
                onClick={handleAnalyzeClick}
                disabled={mlLoading || !selectedIndustry || selectedIndustry === "all"}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {mlLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate ML Insights
                  </>
                )}
              </Button>
              {mlResult?.documentContext && (
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Analysis includes your uploaded documents
                </p>
              )}
            </div>

            {/* Search Filter */}
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Available Solutions</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Rank by:</span>
                <select 
                  value={rankingOption} 
                  onChange={(e) => setRankingOption(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="relevance">Relevance</option>
                  <option value="roi">ROI Potential</option>
                  <option value="complexity">Implementation Complexity</option>
                  <option value="industry">Industry Coverage</option>
                  <option value="popularity">User Adoption</option>
                </select>
              </div>
            </div>

            <UseCaseGrid 
              selectedIndustry={selectedIndustry}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              aiRecommendations={mlResult?.useCases || []}
              rankingOption={rankingOption}
            />
            
            {mlResult?.customerReferences && mlResult.customerReferences.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Similar IFS Customers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  These IFS customers in your industry could benefit from similar ML solutions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mlResult.customerReferences.map((customer, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                      <div>
                        <div className="font-medium text-sm text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-600">{customer.industry}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
