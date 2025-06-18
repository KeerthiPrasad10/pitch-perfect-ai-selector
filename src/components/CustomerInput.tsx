
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Building2, TrendingUp, Sparkles, FileText, Loader2 } from "lucide-react";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customer: string, recommendations: any[]) => void;
}

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

      // Extract insights from RAG answer to enhance recommendations
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

  const analyzeCustomer = async () => {
    if (!customerName.trim()) return;

    setLoading(true);
    setSuggestions([]);

    try {
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

        setSuggestions(data.suggestedCompanies || []);
        onIndustrySelected(data.industry, customerName, enhancedRecommendations);
        
        toast({
          title: "Analysis Complete",
          description: `Identified ${data.industry} industry with ${enhancedRecommendations.length} AI-enhanced recommendations.`,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      analyzeCustomer();
    }
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
              {suggestions.slice(0, 6).map((company, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white/80 text-blue-800 border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={() => setCustomerName(company.name)}
                >
                  {company.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
