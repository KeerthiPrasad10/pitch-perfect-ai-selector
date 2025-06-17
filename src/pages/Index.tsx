
import { useState } from "react";
import { CustomerInput } from "@/components/CustomerInput";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, ChartBar, BadgeDollarSign, Users, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showResults, setShowResults] = useState(false);

  const handleIndustrySelected = (industry: string, customer: string) => {
    setSelectedIndustry(industry);
    setCustomerName(customer);
    setShowResults(true);
  };

  const handleNewSearch = () => {
    setSelectedIndustry("");
    setCustomerName("");
    setSearchTerm("");
    setSelectedCategory("all");
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Sales Compass</h1>
                <p className="text-sm text-gray-600">Identify perfect AI solutions for every prospect</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {showResults && (
                <Button variant="outline" size="sm" onClick={handleNewSearch}>
                  New Customer
                </Button>
              )}
              <Button variant="outline" size="sm">
                <ChartBar className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button size="sm">Export Report</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">150+</h3>
                <p className="text-gray-600">AI Use Cases</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">25+</h3>
                <p className="text-gray-600">Industries Covered</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      AI Solutions for {customerName}
                    </h3>
                    <p className="text-gray-600">
                      Tailored recommendations for the{" "}
                      <span className="font-medium text-blue-700">
                        {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
                      </span>{" "}
                      industry
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
            />
          </>
        )}

        {/* Welcome Message when no results */}
        {!showResults && (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-12 border max-w-2xl mx-auto">
              <Target className="mx-auto h-16 w-16 text-blue-400 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to AI Sales Compass
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Enter your customer's name above and let our AI identify the perfect industry match. 
                We'll then show you the most relevant AI use cases to help close your next deal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">1. Enter Customer</h4>
                  <p className="text-blue-700">Type in your prospect's company name</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">2. AI Analysis</h4>
                  <p className="text-green-700">Our AI identifies their industry</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
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
