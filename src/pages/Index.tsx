
import { useState } from "react";
import { IndustrySelector } from "@/components/IndustrySelector";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Briefcase, ChartBar, BadgeDollarSign } from "lucide-react";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Sales Compass</h1>
                <p className="text-sm text-gray-600">Find the perfect AI use case for every prospect</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                <ChartBar className="h-6 w-6 text-green-600" />
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
                <BadgeDollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">85%</h3>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find AI Use Cases</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <IndustrySelector 
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
            />
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
      </main>
    </div>
  );
};

export default Index;
