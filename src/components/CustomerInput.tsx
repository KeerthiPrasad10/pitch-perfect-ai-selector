
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Building2, TrendingUp, Sparkles, FileText, Loader2, CheckCircle2, AlertCircle, Users, UserCheck, Target, Briefcase } from "lucide-react";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customer: string, recommendations: any[], relatedIndustries?: any[]) => void;
}

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  async function searchDocuments(query: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('rag-query', {
        body: {
          query: `${query} AI use cases solutions recommendations`,
          maxResults: 3,
        },
      });

      if (error) {
        console.log('RAG search error:', error);
        return null;
      }
      return data?.success ? data : null;
    } catch (error) {
      console.log('RAG search not available or error occurred:', error);
      return null;
    }
  }

  async function enhanceRecommendationsWithRAG(recommendations: any[], customerName: string, industry: string) {
    try {
      const ragData = await searchDocuments(`${customerName} ${industry} AI solutions recommendations`);
      
      if (!ragData?.answer) {
        return recommendations;
      }

      const ragInsights = ragData.answer;
      
      return recommendations.map((rec, index) => ({
        ...rec,
        description: index === 0 ? `${rec.description} Based on your documents: ${ragInsights.substring(0, 150)}...` : rec.description,
        ragEnhanced: index === 0,
        ragSources: index === 0 ? ragData.sources : undefined
      }));
    } catch (error) {
      console.log('Error enhancing recommendations with RAG:', error);
      return recommendations;
    }
  }

  async function searchSimilarCompanies(companyName: string) {
    try {
      const { data, error } = await supabase.functions.invoke('search-companies', {
        body: { companyName: companyName.trim() }
      });

      if (error) {
        console.log('Error searching companies:', error);
        return [];
      }

      return data?.suggestions || [];
    } catch (error) {
      console.log('Error searching companies:', error);
      return [];
    }
  }

  const analyzeCustomer = async () => {
    if (!customerName.trim()) return;

    setLoading(true);
    setSuggestions([]);
    setAnalysisResult(null);

    try {
      // First, get similar company suggestions
      const similarCompanies = await searchSimilarCompanies(customerName);
      setSuggestions(similarCompanies);

      // Then analyze the customer/prospect
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: customerName.trim() }
      });

      if (error) throw error;

      if (data?.success) {
        const analysis = data.analysis;
        setAnalysisResult(analysis);

        const enhancedRecommendations = await enhanceRecommendationsWithRAG(
          analysis.documentBasedUseCases || [], 
          customerName, 
          analysis.industry
        );

        toast({
          title: "Analysis Complete",
          description: `${analysis.customerType === 'customer' ? 'Customer' : 'Prospect'} identified in ${analysis.industry} industry with ${enhancedRecommendations.length} recommendations.`,
        });
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing customer:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const proceedWithAnalysis = async () => {
    if (!analysisResult) return;

    try {
      const enhancedRecommendations = await enhanceRecommendationsWithRAG(
        analysisResult.documentBasedUseCases || [], 
        customerName, 
        analysisResult.industry
      );

      onIndustrySelected(
        analysisResult.industry, 
        customerName, 
        enhancedRecommendations,
        analysisResult.relatedIndustries || []
      );
    } catch (error) {
      console.error('Error proceeding with analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    }
  };

  const selectSuggestedCompany = async (companyName: string) => {
    setCustomerName(companyName);
    
    // Automatically analyze the selected company
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: companyName }
      });

      if (error) throw error;

      if (data?.success) {
        const analysis = data.analysis;
        const enhancedRecommendations = await enhanceRecommendationsWithRAG(
          analysis.documentBasedUseCases || [], 
          companyName, 
          analysis.industry
        );

        onIndustrySelected(
          analysis.industry, 
          companyName, 
          enhancedRecommendations,
          analysis.relatedIndustries || []
        );
      }
    } catch (error) {
      console.error('Error analyzing selected company:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      analyzeCustomer();
    }
  };

  const resetSearch = () => {
    setCustomerName("");
    setAnalysisResult(null);
    setSuggestions([]);
  };

  const getRelevanceBadgeColor = (relevance: string) => {
    switch (relevance) {
      case 'primary': return 'bg-purple-100 text-purple-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      case 'tertiary': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceIcon = (relevance: string) => {
    switch (relevance) {
      case 'primary': return <Target className="h-3 w-3" />;
      case 'secondary': return <TrendingUp className="h-3 w-3" />;
      case 'tertiary': return <Briefcase className="h-3 w-3" />;
      default: return <Building2 className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Input Card */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-purple-200 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center space-x-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <span>Customer & Prospect Analysis</span>
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Enter a company name to check if they're an IFS customer or identify them as a prospect with relevant AI solutions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="e.g., Microsoft, Tesla, BMW..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <Button 
              onClick={analyzeCustomer}
              disabled={!customerName.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Document-Enhanced</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>Customer Database</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Analysis Results */}
      {analysisResult && (
        <>
          <Card className={`rounded-2xl shadow-lg ${
            analysisResult.customerType === 'customer' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center space-x-2 ${
                analysisResult.customerType === 'customer' ? 'text-green-900' : 'text-blue-900'
              }`}>
                {analysisResult.customerType === 'customer' ? (
                  <>
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <span>✅ IFS Customer: {analysisResult.companyDetails?.formalName || customerName}</span>
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>🎯 {analysisResult.companyDetails?.formalName || customerName}</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Industry:</span>
                  <Badge className={analysisResult.customerType === 'customer' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {analysisResult.industry}
                  </Badge>
                </div>
                
                {analysisResult.customerType === 'customer' && (
                  <>
                    {analysisResult.companyDetails?.customerNumber && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Customer Number:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {analysisResult.companyDetails.customerNumber}
                        </Badge>
                      </div>
                    )}
                    {analysisResult.companyDetails?.ifsVersion && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">IFS Version:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {analysisResult.companyDetails.ifsVersion}
                        </Badge>
                      </div>
                    )}
                    {analysisResult.companyDetails?.softwareReleaseVersion && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Software Release:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {analysisResult.companyDetails.softwareReleaseVersion}
                        </Badge>
                      </div>
                    )}
                    {analysisResult.companyDetails?.customerSince && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Customer Since:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {analysisResult.companyDetails.customerSince}
                        </Badge>
                      </div>
                    )}
                  </>
                )}

                {analysisResult.companyDetails && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Company Details:</span>
                    <div className="text-sm text-gray-600 mt-1">
                      {analysisResult.companyDetails.description}
                      {analysisResult.companyDetails.revenue && (
                        <span className="ml-2">• Revenue: {analysisResult.companyDetails.revenue}</span>
                      )}
                      {analysisResult.companyDetails.employees && (
                        <span className="ml-2">• Employees: {analysisResult.companyDetails.employees}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {analysisResult.customerType === 'customer' && analysisResult.currentUseCases && analysisResult.currentUseCases.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Current ML Use Cases:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysisResult.currentUseCases.map((useCase: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <strong>Analysis:</strong> {analysisResult.reasoning}
                </div>
                
                {analysisResult.documentBasedUseCases && analysisResult.documentBasedUseCases.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      📄 Found {analysisResult.documentBasedUseCases.length} relevant use case(s) in uploaded documents
                    </div>
                    <div className="text-xs text-gray-600">
                      {analysisResult.customerType === 'customer' 
                        ? 'Additional opportunities beyond current implementations'
                        : 'Recommended AI solutions for this prospect'
                      }
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={proceedWithAnalysis}
                  className={`flex-1 ${
                    analysisResult.customerType === 'customer'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  } text-white`}
                >
                  {analysisResult.customerType === 'customer' ? 'View Customer Opportunities' : 'View Prospect Recommendations'}
                </Button>
                <Button variant="outline" onClick={resetSearch}>
                  Search Different Company
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Industries */}
          {analysisResult.relatedIndustries && analysisResult.relatedIndustries.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-900 flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Industry Analysis & ML Opportunities</span>
                </CardTitle>
                <p className="text-sm text-purple-700">
                  Core industry and related opportunities ranked by relevance
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.relatedIndustries.map((industryInfo: any, index: number) => (
                    <div key={index} className="bg-white/80 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getRelevanceBadgeColor(industryInfo.relevance)} flex items-center space-x-1`}>
                            {getRelevanceIcon(industryInfo.relevance)}
                            <span>{industryInfo.relevance === 'primary' ? 'Core Industry' : 
                                   industryInfo.relevance === 'secondary' ? 'Related Industry' : 
                                   'Additional Opportunity'}</span>
                          </Badge>
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {industryInfo.industry}
                          </h4>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {industryInfo.description}
                      </p>
                      
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Key ML Use Cases:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {industryInfo.useCases.slice(0, 4).map((useCase: string, ucIndex: number) => (
                          <Badge 
                            key={ucIndex} 
                            variant="outline" 
                            className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                          >
                            {useCase}
                          </Badge>
                        ))}
                        {industryInfo.useCases.length > 4 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                            +{industryInfo.useCases.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Similar Companies */}
      {suggestions.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Similar IFS Companies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 8).map((company, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white/80 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => selectSuggestedCompany(company.name)}
                >
                  {company.name}
                  {company.isIFSCustomer && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1 rounded">IFS</span>
                  )}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Click on any company name to analyze it directly
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
