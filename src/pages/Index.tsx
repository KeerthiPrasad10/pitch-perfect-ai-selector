
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/ifs-logo.png" 
                alt="IFS Logo" 
                className="h-10 w-auto"
              />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">AI Use Case Identifier</h1>
                <p className="text-sm text-gray-600">Identify perfect AI solutions for every prospect</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {showResults && (
                <Button variant="outline" size="sm" onClick={handleNewSearch}>
                  New Customer
                </Button>
              )}
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">150+</h3>
                <p className="text-gray-600">AI Use Cases</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">25+</h3>
                <p className="text-gray-600">Industries Covered</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-purple-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">95%</h3>
                <p className="text-gray-600">Customer Match Rate</p>
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
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      AI Solutions for {customerName}
                    </h3>
                    <p className="text-gray-600">
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
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-purple-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Refine Recommendations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        {/* Welcome Message when no results */}
        {!showResults && (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-12 border border-purple-100 max-w-2xl mx-auto">
              <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Target className="h-10 w-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to IFS AI Use Case Identifier
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Enter your customer's name above and let our AI identify the perfect industry match. 
                We'll then show you the most relevant AI use cases to help close your next deal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">1. Enter Customer</h4>
                  <p className="text-purple-700">Type in your prospect's company name</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">2. AI Analysis</h4>
                  <p className="text-purple-700">Our AI identifies their industry</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">3. Get Solutions</h4>
                  <p className="text-purple-700">View tailored AI use cases</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
