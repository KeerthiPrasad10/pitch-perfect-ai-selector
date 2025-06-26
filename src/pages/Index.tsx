
import { useState } from "react";
import { CustomerInput } from "@/components/CustomerInput";
import { IndustrySelector } from "@/components/IndustrySelector";
import { FileUpload } from "@/components/FileUpload";
import { SearchFilter } from "@/components/SearchFilter";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { ExcelProcessor } from "@/components/ExcelProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Search, Upload } from "lucide-react";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [relatedIndustries, setRelatedIndustries] = useState<any[]>([]);
  const [customerAnalysis, setCustomerAnalysis] = useState<any>(null);

  const handleCustomerAnalysis = (industry: string, customer: string, recommendations: any[], related: any[], analysis?: any) => {
    console.log("Customer analysis received:", analysis);
    setCustomerAnalysis(analysis);
    setCustomerName(customer);
    setSelectedIndustry(industry);
    setRelatedIndustries(related);
    setAiRecommendations(recommendations);
  };

  const handleDocumentAnalysis = () => {
    console.log("Document processed");
    // Refresh the use case grid when new documents are processed
  };

  const handleDataProcessed = () => {
    // Refresh the use case grid when new Excel data is processed
    console.log("Excel data processed, refreshing use cases...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IFS AI Solution Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover validated AI and ML solutions tailored for your industry and IFS deployment. 
            Upload documents or Excel data to find relevant use cases with confirmed capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Customer Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerInput onIndustrySelected={handleCustomerAnalysis} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span>Document Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload onFileProcessed={handleDocumentAnalysis} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <ExcelProcessor onDataProcessed={handleDataProcessed} />
          </div>

          <div className="lg:col-span-2">
            <UseCaseGrid
              selectedIndustry={selectedIndustry}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              aiRecommendations={aiRecommendations}
              customerName={customerName}
              relatedIndustries={relatedIndustries}
              customerAnalysis={customerAnalysis}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
