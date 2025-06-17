
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/ifs-logo.png" 
                alt="IFS Logo" 
                className="h-8 sm:h-10 w-auto"
              />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AI Use Case Identifier
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Identify perfect AI solutions for every prospect</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {showResults && (
                <Button variant="outline" size="sm" onClick={handleNewSearch} className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50">
                  New Customer
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
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
        {/* Hero Section when no results */}
        {!showResults && (
          <>
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl mb-12">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center">
                <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                  We design modern AI solutions
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Enter your customer's name and let our AI identify the perfect industry match with tailored recommendations.
                </p>
                <Button 
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-8 py-3 text-lg font-medium rounded-full transition-all duration-200 hover:shadow-xl"
                  onClick={() => document.getElementById('customer-input')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  GET STARTED
                </Button>
              </div>
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-16">
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">TARGETING</h4>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">ANALYTICS</h4>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">CUSTOMERS</h4>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">STRATEGY</h4>
              </div>
            </div>
          </>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-3 rounded-xl shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">150+</h3>
                <p className="text-gray-600 text-sm">AI Use Cases</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">25+</h3>
                <p className="text-gray-600 text-sm">Industries Covered</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 p-3 rounded-xl shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900">95%</h3>
                <p className="text-gray-600 text-sm">Customer Match Rate</p>
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
            <Card className="mb-6 bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                      AI Solutions for {customerName}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Tailored recommendations for the{" "}
                      <span className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
                  <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-3 rounded-xl shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
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
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
