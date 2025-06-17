
import { useState } from "react";
import { CustomerInput } from "@/components/CustomerInput";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Users, Briefcase, FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showResults, setShowResults] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const { toast } = useToast();

  const handleIndustrySelected = (industry: string, customer: string, recommendations: any[] = []) => {
    setSelectedIndustry(industry);
    setCustomerName(customer);
    setAiRecommendations(recommendations);
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setSelectedIndustry("");
    setCustomerName("");
    setSearchTerm("");
    setSelectedCategory("all");
    setAiRecommendations([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/ifs-logo.png" 
                alt="IFS Logo" 
                className="h-8 sm:h-10 w-auto"
              />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">AI Use Case Identifier</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Identify perfect AI solutions for every prospect</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {showResults && (
                <Button variant="outline" size="sm" onClick={handleNewSearch} className="flex-1 sm:flex-none">
                  New Customer
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg flex-1 sm:flex-none"
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
        {/* Welcome Message when no results */}
        {!showResults && (
          <div className="text-center py-8 sm:py-16 mb-6 sm:mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-12 border border-purple-200 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Target className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-800 to-indigo-800 bg-clip-text text-transparent mb-4">
                Welcome to IFS AI Use Case Identifier
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Enter your customer's name and let our AI identify the perfect industry match. 
                We'll show you the most relevant AI use cases to help close your next deal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-purple-500 p-2 rounded-lg w-8 h-8 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2">Enter Customer</h4>
                  <p className="text-purple-700 text-sm">Type in your prospect's company name</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-indigo-500 p-2 rounded-lg w-8 h-8 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h4 className="font-semibold text-indigo-900 mb-2">AI Analysis</h4>
                  <p className="text-indigo-700 text-sm">Our AI identifies their industry</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-emerald-500 p-2 rounded-lg w-8 h-8 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h4 className="font-semibold text-emerald-900 mb-2">Get Solutions</h4>
                  <p className="text-emerald-700 text-sm">View tailored AI use cases</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">150+</h3>
                <p className="text-gray-600 text-sm">AI Use Cases</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">25+</h3>
                <p className="text-gray-600 text-sm">Industries Covered</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">95%</h3>
                <p className="text-gray-600 text-sm">Customer Match Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Input */}
        <CustomerInput onIndustrySelected={handleIndustrySelected} />

        {/* Results Section */}
        {showResults && (
          <>
            {/* Customer Summary */}
            <Card className="mb-6 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border-purple-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      AI Solutions for {customerName}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Tailored recommendations for the{" "}
                      <span className="font-medium text-purple-700">
                        {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
                      </span>{" "}
                      industry
                      {aiRecommendations.length > 0 && (
                        <span className="ml-2 text-purple-600">
                          • {aiRecommendations.length} AI-powered recommendations
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
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Refine Recommendations</h2>
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
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
