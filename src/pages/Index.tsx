
import { useState } from "react";
import { CustomerInput } from "@/components/CustomerInput";
import { IndustrySelector } from "@/components/IndustrySelector";
import { FileUpload } from "@/components/FileUpload";
import { SearchFilter } from "@/components/SearchFilter";
import { UseCaseGrid } from "@/components/UseCaseGrid";
import { ExcelProcessor } from "@/components/ExcelProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Search, Upload, FileSpreadsheet } from "lucide-react";

const Index = () => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [relatedIndustries, setRelatedIndustries] = useState<any[]>([]);
  const [customerAnalysis, setCustomerAnalysis] = useState<any>(null);

  const handleCustomerAnalysis = (analysis: any) => {
    console.log("Customer analysis received:", analysis);
    setCustomerAnalysis(analysis);
    setCustomerName(analysis?.customerName || "");
    setSelectedIndustry(analysis?.industry || "");
    setRelatedIndustries(analysis?.relatedIndustries || []);
  };

  const handleDocumentAnalysis = (recommendations: any[]) => {
    console.log("Document recommendations received:", recommendations);
    setAiRecommendations(recommendations);
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

        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Analyze Customer</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Documents</span>
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Process Excel Data</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
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
                    <CustomerInput onAnalysisComplete={handleCustomerAnalysis} />
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
          </TabsContent>

          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5 text-green-600" />
                      <span>Document Upload</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload 
                      onAnalysisComplete={handleDocumentAnalysis}
                      customerName={customerName}
                    />
                  </CardContent>
                </Card>
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
          </TabsContent>

          <TabsContent value="excel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ExcelProcessor onDataProcessed={handleDataProcessed} />
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Excel Data Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-600 space-y-4">
                      <p>
                        Upload your IFS Module Mapping Excel file to directly populate the database 
                        with ML capabilities data. This bypasses the embedding approach and provides 
                        direct, factual data extraction.
                      </p>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Benefits of Direct Excel Processing:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                          <li>Faster and more reliable than embedding-based search</li>
                          <li>Direct mapping of ML capabilities to IFS modules</li>
                          <li>Industry and version-specific matching</li>
                          <li>Immediate availability after processing</li>
                        </ul>
                      </div>

                      <p className="text-sm text-gray-500">
                        Once processed, the data will be used to validate use cases against 
                        actual IFS ML capabilities for more accurate recommendations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
