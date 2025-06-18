
import { useState } from "react";
import { CustomerInput } from "@/components/CustomerInput";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Users, Briefcase, FileSpreadsheet, Brain, Zap, BarChart3, Settings } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showResults, setShowResults] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [relatedIndustries, setRelatedIndustries] = useState<any[]>([]);
  const { toast } = useToast();

  const handleIndustrySelected = (industry: string, customer: string, recommendations: any[] = [], related: any[] = []) => {
    setSelectedIndustry(industry || "");
    setCustomerName(customer || "");
    setAiRecommendations(recommendations || []);
    setRelatedIndustries(related || []);
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setSelectedIndustry("");
    setCustomerName("");
    setSearchTerm("");
    setSelectedCategory("all");
    setAiRecommendations([]);
    setRelatedIndustries([]);
    setShowResults(false);
  };

  const handleExportReport = () => {
    if (!showResults) {
      toast({
        title: "No data to export",
        description: "Please analyze a customer first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToExcel(customerName, selectedIndustry, aiRecommendations, searchTerm, selectedCategory);
      toast({
        title: "Report exported successfully",
        description: "The Excel file has been downloaded to your computer.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the Excel file.",
        variant: "destructive",
      });
    }
  };

  const formatIndustryName = (industry: string) => {
    if (!industry || typeof industry !== 'string') return '';
    return industry.charAt(0).toUpperCase() + industry.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-purple-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <img 
                src="/public/lovable-uploads/276c78fd-f333-4917-8105-2e8759fbf881.png" 
                alt="IFS Logo" 
                className="h-8 sm:h-10 w-auto"
              />
              <div className="border-l border-purple-200 pl-4">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">
                  AI Use Case Identifier
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">We are identifying AI solutions for IFS customers and prospects</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {showResults && (
                <Button variant="outline" size="sm" onClick={handleNewSearch} className="flex-1 sm:flex-none border-purple-200 hover:bg-purple-50">
                  New Analysis
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
                onClick={handleExportReport}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* IFS AI Use Case Identifier Welcome Section */}
        {!showResults && (
          <div className="text-center mb-12">
            <div className="relative overflow-hidden rounded-3xl mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  IFS AI Use Case Identifier
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Enter a prospect or current IFS customer name to automatically identify their industry and discover relevant AI use cases within IFS solutions.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    AI-Powered Analysis
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Industry Insights
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Targeted Solutions
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-purple-100/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-md">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-slate-800">150+</h3>
                <p className="text-slate-600 text-sm">AI Use Cases</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-purple-100/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-slate-800">25+</h3>
                <p className="text-slate-600 text-sm">Industries Covered</p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-purple-100/50">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-slate-800">95%</h3>
                <p className="text-slate-600 text-sm">Match Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Input */}
        <div id="customer-input">
          <CustomerInput onIndustrySelected={handleIndustrySelected} />
        </div>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Customer Summary */}
            <Card className="mb-6 bg-gradient-to-r from-purple-50/80 via-indigo-50/80 to-violet-50/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-1">
                      AI Solutions for {customerName}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base">
                      Tailored recommendations for the{" "}
                      <span className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {formatIndustryName(selectedIndustry)}
                      </span>{" "}
                      industry
                      {aiRecommendations.length > 0 && (
                        <span className="ml-2 text-purple-600">
                          • {aiRecommendations.length} AI-powered recommendations
                        </span>
                      )}
                      {relatedIndustries.length > 0 && (
                        <span className="ml-2 text-indigo-600">
                          • {relatedIndustries.length} related industries analyzed
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Filters */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 p-6 mb-8">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Refine Recommendations
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>

            {/* Results */}
            <UseCaseGrid 
              selectedIndustry={selectedIndustry}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              aiRecommendations={aiRecommendations}
              customerName={customerName}
              relatedIndustries={relatedIndustries}
            />
          </>
        )}
      </main>
    </div>
  );
};

function handleExportReport() {
  if (!showResults) {
    toast({
      title: "No data to export",
      description: "Please analyze a customer first to generate a report.",
      variant: "destructive",
    });
    return;
  }

  try {
    exportToExcel(customerName, selectedIndustry, aiRecommendations, searchTerm, selectedCategory);
    toast({
      title: "Report exported successfully",
      description: "The Excel file has been downloaded to your computer.",
    });
  } catch (error) {
    toast({
      title: "Export failed",
      description: "There was an error generating the Excel file.",
      variant: "destructive",
    });
  }
}

function formatIndustryName(industry: string) {
  if (!industry || typeof industry !== 'string') return '';
  return industry.charAt(0).toUpperCase() + industry.slice(1);
}

export default Index;
