import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Building2, TrendingUp, Sparkles, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customer: string, recommendations: any[]) => void;
}

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifiedCompany, setIdentifiedCompany] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [needsSelection, setNeedsSelection] = useState(false);
  const { toast } = useToast();

  const searchDocuments = async (query: string) => {
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
  };

  const enhanceRecommendationsWithRAG = async (recommendations: any[], customerName: string, industry: string) => {
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
  };

  const searchSimilarCompanies = async (companyName: string) => {
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
  };

  const analyzeCustomer = async () => {
    if (!customerName.trim()) return;

    setLoading(true);
    setSuggestions([]);
    setIdentifiedCompany(null);
    setNeedsSelection(false);

    try {
      // First, get similar company suggestions
      const similarCompanies = await searchSimilarCompanies(customerName);
      setSuggestions(similarCompanies);

      // Then analyze the industry
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: customerName.trim() }
      });

      if (error) throw error;

      if (data?.success) {
        const enhancedRecommendations = await enhanceRecommendationsWithRAG(
          data.relevantUseCases || [], 
          customerName, 
          data.industry
        );

        if (data.analysis?.confidence === 'high') {
          // Company successfully identified
          setIdentifiedCompany({
            name: customerName,
            industry: data.industry,
            confidence: data.analysis.confidence,
            reasoning: data.analysis.reasoning
          });
        } else {
          // Company needs manual selection
          setNeedsSelection(true);
        }
        
        toast({
          title: "Analysis Complete",
          description: `Identified ${data.industry} industry with ${enhancedRecommendations.length} recommendations.`,
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

  const proceedWithIdentifiedCompany = async () => {
    if (!identifiedCompany) return;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: identifiedCompany.name }
      });

      if (error) throw error;

      if (data?.success) {
        const enhancedRecommendations = await enhanceRecommendationsWithRAG(
          data.relevantUseCases || [], 
          identifiedCompany.name, 
          data.industry
        );

        onIndustrySelected(data.industry, identifiedCompany.name, enhancedRecommendations);
      }
    } catch (error) {
      console.error('Error proceeding with company:', error);
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
        const enhancedRecommendations = await enhanceRecommendationsWithRAG(
          data.relevantUseCases || [], 
          companyName, 
          data.industry
        );

        onIndustrySelected(data.industry, companyName, enhancedRecommendations);
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
    setIdentifiedCompany(null);
    setSuggestions([]);
    setNeedsSelection(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-purple-200 rounded-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center space-x-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            <span>Customer Analysis</span>
          </CardTitle>
          <p className="text-slate-600 text-sm">
            Enter a customer or prospect name to identify their industry and discover relevant AI solutions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="e.g., Microsoft, Tesla, Maersk..."
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
              <Sparkles className="h-3 w-3" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Successfully Identified (Green) */}
      {identifiedCompany && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-2xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-900 flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>✅ Company Identified: {identifiedCompany.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Industry:</span>
                <Badge className="bg-green-100 text-green-800 capitalize">
                  {identifiedCompany.industry}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Confidence:</span>
                <Badge className="bg-green-100 text-green-800">
                  {identifiedCompany.confidence}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <strong>AI Reasoning:</strong> {identifiedCompany.reasoning}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={proceedWithIdentifiedCompany}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                Proceed with Analysis
              </Button>
              <Button variant="outline" onClick={resetSearch}>
                Search Different Company
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Selection Needed (Amber) */}
      {needsSelection && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 rounded-2xl shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-amber-900 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Company Selection Needed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 mb-4">
              We couldn't automatically identify "{customerName}". Please select from similar companies below or try a different search term.
            </p>
            <Button variant="outline" onClick={resetSearch} className="border-amber-300 text-amber-700 hover:bg-amber-100">
              Try Different Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Similar Companies */}
      {suggestions.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Similar Companies</span>
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
