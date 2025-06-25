
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, CheckCircle, AlertCircle, Cloud, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customer: string, recommendations: any[], related: any[], analysis?: any) => void;
}

const getDeploymentIcon = (deploymentType: string) => {
  if (deploymentType?.toLowerCase() === 'cloud') {
    return <Cloud className="h-3 w-3" />;
  } else if (deploymentType?.toLowerCase() === 'remote') {
    return <Server className="h-3 w-3" />;
  }
  return null;
};

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Please enter a customer name",
        description: "Enter a company name to analyze their industry and AI opportunities.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log('Starting analysis for:', customerName);
      
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: customerName.trim() }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Analysis result:', data);

      if (data?.success && data?.analysis) {
        setAnalysisResult(data.analysis);
        
        // Call the callback with the analysis results
        onIndustrySelected(
          data.industry || data.analysis.industry,
          customerName.trim(),
          data.relevantUseCases || data.analysis.documentBasedUseCases,
          data.relatedIndustries || data.analysis.relatedIndustries,
          data.analysis
        );
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-purple-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-violet-600/10 border-b border-purple-100">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-purple-600" />
            Customer Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Customer or Prospect Name
              </label>
              <div className="flex space-x-3">
                <Input
                  id="customer-name"
                  type="text"
                  placeholder="e.g., Microsoft, Tesla, Siemens..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 text-lg border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl"
                  disabled={isAnalyzing}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !customerName.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 rounded-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Our AI will analyze the company, identify their industry, and suggest relevant AI use cases from IFS solutions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-purple-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-purple-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              {analysisResult.customerType === 'customer' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  IFS Customer Identified
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Prospect Analysis
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4">
              {analysisResult.customerType === 'customer' && (
                <>
                  {analysisResult.companyDetails?.customerNumber && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Customer Number:</span>
                      <Badge className="bg-green-100 text-green-800">
                        #{analysisResult.companyDetails.customerNumber}
                      </Badge>
                    </div>
                  )}
                  {analysisResult.companyDetails?.releaseVersion && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Release Version:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {analysisResult.companyDetails.releaseVersion}
                      </Badge>
                    </div>
                  )}
                  {analysisResult.companyDetails?.baseIfsVersion && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Base Version:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {analysisResult.companyDetails.baseIfsVersion}
                      </Badge>
                    </div>
                  )}
                  {analysisResult.companyDetails?.ifsVersion && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Deployment:</span>
                      <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
                        {getDeploymentIcon(analysisResult.companyDetails.ifsVersion)}
                        <span>{analysisResult.companyDetails.ifsVersion}</span>
                      </Badge>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t pt-3 mt-3">
                <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {analysisResult.reasoning}
                </p>
              </div>
              
              {analysisResult.companyDetails?.description && (
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-gray-900 mb-2">Company Overview</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {analysisResult.companyDetails.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
