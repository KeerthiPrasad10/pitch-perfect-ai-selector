
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Check, Sparkles, AlertCircle, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerInputProps {
  onIndustrySelected: (industry: string, customerName: string, aiRecommendations?: any[]) => void;
}

export const CustomerInput = ({ onIndustrySelected }: CustomerInputProps) => {
  const [customerName, setCustomerName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showIndustrySelection, setShowIndustrySelection] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const analyzeIndustry = async (companyName: string) => {
    setIsSearching(true);
    
    try {
      console.log('Calling analyze-industry function for:', companyName);
      
      const { data, error } = await supabase.functions.invoke('analyze-industry', {
        body: { customerName: companyName }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Analysis result:', data);
      
      if (data.success) {
        setAnalysisResult(data.analysis);
        setShowIndustrySelection(true);
        setSelectedCompany(companyName);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing industry:', error);
      // Fallback to unknown with all industries
      const allIndustries = [
        "manufacturing", "healthcare", "finance", "retail", "technology", 
        "automotive", "energy", "utilities", "education", "government", 
        "logistics", "media", "insurance", "real-estate", "agriculture", 
        "hospitality", "construction", "engineering", "aerospace", 
        "defence", "service", "telco", "other"
      ];
      setAnalysisResult({
        industry: "unknown",
        confidence: "unknown",
        reasoning: "Unable to analyze company - please select the appropriate industry",
        suggestedCategories: allIndustries,
        relevantUseCases: [],
        requiresManualSelection: true,
        suggestedCompanies: []
      });
      setShowIndustrySelection(true);
      setSelectedCompany(companyName);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (customerName.trim()) {
      analyzeIndustry(customerName);
    }
  };

  const handleCompanySelect = (companyName: string, companyIndustry: string) => {
    setSelectedCompany(companyName);
    setCustomerName(companyName);
    
    // Filter industries to show the company's industry first, then others
    const filteredIndustries = analysisResult?.suggestedCategories?.filter(
      (industry: string) => industry.toLowerCase() === companyIndustry.toLowerCase()
    ) || [];
    
    const otherIndustries = analysisResult?.suggestedCategories?.filter(
      (industry: string) => industry.toLowerCase() !== companyIndustry.toLowerCase()
    ) || [];

    setAnalysisResult({
      ...analysisResult,
      industry: companyIndustry.toLowerCase(),
      confidence: "medium",
      reasoning: `Selected company: ${companyName} - ${companyIndustry} industry`,
      suggestedCategories: [...filteredIndustries, ...otherIndustries],
      primaryIndustry: companyIndustry.toLowerCase()
    });
  };

  const handleIndustrySelect = (industry: string) => {
    // Pass the AI recommendations along with the industry selection
    onIndustrySelected(industry, selectedCompany || customerName, analysisResult?.relevantUseCases || []);
    setShowIndustrySelection(false);
    setAnalysisResult(null);
  };

  const industryLabels: { [key: string]: string } = {
    "healthcare": "Healthcare & Life Sciences",
    "finance": "Financial Services",
    "retail": "Retail & E-commerce",
    "manufacturing": "Manufacturing",
    "technology": "Technology & Software",
    "automotive": "Automotive",
    "energy": "Energy & Utilities",
    "utilities": "Energy & Utilities",
    "resources": "Energy, Utilities & Resources",
    "education": "Education",
    "government": "Government & Public Sector",
    "logistics": "Logistics & Supply Chain",
    "media": "Media & Entertainment",
    "insurance": "Insurance",
    "real-estate": "Real Estate",
    "agriculture": "Agriculture",
    "hospitality": "Hospitality & Travel",
    "construction": "Construction & Engineering",
    "engineering": "Construction & Engineering",
    "aerospace": "Aerospace & Defence",
    "defence": "Aerospace & Defence",
    "service": "Service",
    "telco": "Telecommunications",
    "other": "Other",
    "unknown": "Unable to Identify"
  };

  const getDisplayLabel = (industry: string) => {
    return industryLabels[industry.toLowerCase()] || industry.charAt(0).toUpperCase() + industry.slice(1);
  };

  return (
    <Card className="mb-8 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
        <CardTitle className="flex items-center space-x-2">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-purple-900">IFS Customer Analysis</span>
          <Sparkles className="h-4 w-4 text-purple-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter customer/company name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-base border-purple-200 focus:border-purple-500"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={!customerName.trim() || isSearching}
            className="px-6 bg-purple-600 hover:bg-purple-700"
          >
            {isSearching ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {showIndustrySelection && analysisResult && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-medium text-purple-900">
              <span className="flex items-center space-x-2">
                {analysisResult.industry === 'unknown' || analysisResult.requiresManualSelection ? (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>
                  {analysisResult.industry === 'unknown' || analysisResult.requiresManualSelection 
                    ? `Unable to identify "${customerName}" - Please select industry`
                    : `AI Analysis for "${selectedCompany || customerName}"`
                  }
                </span>
              </span>
            </div>
            
            {/* Suggested Companies Section */}
            {analysisResult.suggestedCompanies && analysisResult.suggestedCompanies.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-purple-600 font-medium flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <span>Did you mean one of these companies?</span>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {analysisResult.suggestedCompanies.map((company: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompanySelect(company.name, company.industry)}
                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100 justify-start h-auto py-2"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-purple-500">{getDisplayLabel(company.industry)}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {analysisResult.industry !== 'unknown' && !analysisResult.requiresManualSelection && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Primary Industry:</span>
                    <Badge className={`
                      ${analysisResult.confidence === 'high' ? 'bg-green-100 text-green-800' : 
                        analysisResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}
                    `}>
                      {analysisResult.confidence} confidence
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => handleIndustrySelect(analysisResult.industry)}
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    <span>{getDisplayLabel(analysisResult.industry)}</span>
                  </Button>
                </>
              )}
              
              {analysisResult.suggestedCategories && analysisResult.suggestedCategories.length > 0 && (
                <>
                  <div className="text-xs text-purple-600 font-medium">
                    {analysisResult.requiresManualSelection || analysisResult.industry === 'unknown' 
                      ? 'Or select the appropriate industry:' 
                      : 'Alternative Options:'
                    }
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {analysisResult.suggestedCategories
                      .filter((cat: string) => cat !== analysisResult.industry || analysisResult.industry === 'unknown')
                      .slice(0, analysisResult.primaryIndustry ? 12 : analysisResult.suggestedCategories.length)
                      .map((industry: string) => (
                      <Button
                        key={industry}
                        variant="outline"
                        size="sm"
                        onClick={() => handleIndustrySelect(industry)}
                        className={`text-xs border-purple-300 text-purple-700 hover:bg-purple-100 justify-start ${
                          industry.toLowerCase() === analysisResult.primaryIndustry ? 'bg-purple-100 border-purple-500' : ''
                        }`}
                      >
                        {getDisplayLabel(industry)}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              
              {analysisResult.reasoning && (
                <div className="text-xs text-purple-600 bg-white p-2 rounded border">
                  <strong>
                    {analysisResult.industry === 'unknown' || analysisResult.requiresManualSelection 
                      ? 'Note:' 
                      : 'AI Reasoning:'
                    }
                  </strong> {analysisResult.reasoning}
                </div>
              )}

              {analysisResult.relevantUseCases && analysisResult.relevantUseCases.length > 0 && (
                <div className="text-xs text-purple-600 bg-white p-2 rounded border">
                  <strong>AI Found:</strong> {analysisResult.relevantUseCases.length} tailored use case{analysisResult.relevantUseCases.length !== 1 ? 's' : ''} for this industry
                </div>
              )}
            </div>
            
            <p className="text-xs text-purple-500">
              Select the most relevant industry to see tailored AI use cases
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
